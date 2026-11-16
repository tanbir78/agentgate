package com.agentgate.identity.application;

import com.agentgate.identity.domain.Agent;
import com.agentgate.identity.domain.Clearance;
import com.agentgate.audit.application.AuditService;
import com.agentgate.audit.application.AuditActorProvider;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import static com.agentgate.identity.application.AgentDtos.*;

@Service
public class AgentService {
    private final AgentStore repository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final AuditActorProvider auditActorProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    public AgentService(
            AgentStore repository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            AuditActorProvider auditActorProvider) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.auditActorProvider = auditActorProvider;
    }

    @Transactional
    public CreatedAgentResponse create(CreateAgentRequest request) {
        String clientId = "ag_" + UUID.randomUUID().toString().replace("-", "");
        byte[] secretBytes = new byte[36];
        secureRandom.nextBytes(secretBytes);
        String rawSecret = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        Agent agent = repository.save(new Agent(
                request.name(), clientId, passwordEncoder.encode(rawSecret), request.clearance()));

        auditService.record(
                auditActorProvider.currentActor(),
                agent.getId(),
                null,
                "AGENT_CREATED",
                null,
                "Agent created: " + agent.getName());

        // The raw secret is returned exactly once. Only the BCrypt hash is persisted.
        return new CreatedAgentResponse(agent.getId(), agent.getName(), clientId,
                rawSecret, agent.getClearance(), agent.isActive(), agent.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public Page<AgentResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Agent requireActiveByClientId(String clientId) {
        Agent agent = repository.findByClientId(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid client credentials"));
        if (!agent.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Agent is disabled");
        }
        return agent;
    }


    @Transactional
    public AgentResponse update(UUID id, UpdateAgentRequest request) {
        Agent agent = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        agent.updateProfile(request.name(), request.clearance());
        agent.setActive(request.active());

        auditService.record(
                auditActorProvider.currentActor(),
                agent.getId(),
                null,
                "AGENT_UPDATED",
                null,
                "Agent profile updated: " + agent.getName());

        return toResponse(agent);
    }

    @Transactional
    public void deactivate(UUID id) {
        Agent agent = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        agent.setActive(false);

        auditService.record(
                auditActorProvider.currentActor(),
                agent.getId(),
                null,
                "AGENT_DEACTIVATED",
                null,
                "Agent deactivated: " + agent.getName());
    }

    private AgentResponse toResponse(Agent agent) {
        return new AgentResponse(agent.getId(), agent.getName(), agent.getClientId(),
                agent.getClearance(), agent.isActive(), agent.getCreatedAt(), agent.getUpdatedAt());
    }
}
