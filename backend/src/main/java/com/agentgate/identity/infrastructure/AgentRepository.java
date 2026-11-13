package com.agentgate.identity.infrastructure;

import com.agentgate.identity.domain.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AgentRepository extends JpaRepository<Agent, UUID> {
    Optional<Agent> findByClientId(String clientId);
    boolean existsByClientId(String clientId);
}
