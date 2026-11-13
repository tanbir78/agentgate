package com.agentgate.identity.infrastructure;

import com.agentgate.identity.application.AgentStore;
import com.agentgate.identity.domain.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AgentStoreAdapter implements AgentStore {
    private final AgentRepository repository;
    public AgentStoreAdapter(AgentRepository repository) { this.repository = repository; }
    @Override public Agent save(Agent agent) { return repository.save(agent); }
    @Override public Optional<Agent> findById(UUID id) { return repository.findById(id); }
    @Override public Optional<Agent> findByClientId(String clientId) { return repository.findByClientId(clientId); }
    @Override public boolean existsByClientId(String clientId) { return repository.existsByClientId(clientId); }
    @Override public Page<Agent> findAll(Pageable pageable) { return repository.findAll(pageable); }
}
