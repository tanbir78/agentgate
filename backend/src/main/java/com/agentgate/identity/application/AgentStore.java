package com.agentgate.identity.application;

import com.agentgate.identity.domain.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

/** Persistence port: the identity application layer does not depend on Spring Data JPA. */
public interface AgentStore {
    Agent save(Agent agent);
    Optional<Agent> findById(UUID id);
    Optional<Agent> findByIdAndActiveTrue(UUID id);
    Optional<Agent> findByClientId(String clientId);
    boolean existsByClientId(String clientId);
    Page<Agent> findAll(Pageable pageable);
}

