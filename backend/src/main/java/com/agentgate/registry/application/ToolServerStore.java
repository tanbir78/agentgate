package com.agentgate.registry.application;

import com.agentgate.registry.domain.ToolServer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ToolServerStore {
    ToolServer save(ToolServer server);
    Optional<ToolServer> findById(UUID id);
    boolean existsByName(String name);
    Page<ToolServer> findAll(Pageable pageable);
}
