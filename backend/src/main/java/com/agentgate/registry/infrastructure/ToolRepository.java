package com.agentgate.registry.infrastructure;

import com.agentgate.registry.domain.ToolDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ToolRepository extends JpaRepository<ToolDefinition, UUID> {
    Optional<ToolDefinition> findByName(String name);
    boolean existsByName(String name);
    Page<ToolDefinition> findByActiveTrue(Pageable pageable);
    List<ToolDefinition> findByActiveTrueOrderByNameAsc();
}
