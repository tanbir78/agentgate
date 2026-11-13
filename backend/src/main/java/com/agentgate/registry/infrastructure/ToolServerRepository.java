package com.agentgate.registry.infrastructure;

import com.agentgate.registry.domain.ToolServer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ToolServerRepository extends JpaRepository<ToolServer, UUID> {
    boolean existsByName(String name);
}
