package com.agentgate.registry.application;

import com.agentgate.registry.domain.ToolDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Persistence port for the registry module. */
public interface ToolStore {
    ToolDefinition save(ToolDefinition tool);
    Optional<ToolDefinition> findById(UUID id);
    Optional<ToolDefinition> findByName(String name);
    boolean existsByName(String name);
    Page<ToolDefinition> findAll(Pageable pageable);
    Page<ToolDefinition> findByActiveTrue(Pageable pageable);
    List<ToolDefinition> findByActiveTrueOrderByNameAsc();
}
