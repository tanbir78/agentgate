package com.agentgate.registry.infrastructure;

import com.agentgate.registry.application.ToolStore;
import com.agentgate.registry.domain.ToolDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ToolStoreAdapter implements ToolStore {
    private final ToolRepository repository;
    public ToolStoreAdapter(ToolRepository repository) { this.repository = repository; }
    @Override public ToolDefinition save(ToolDefinition tool) { return repository.save(tool); }
    @Override public Optional<ToolDefinition> findById(UUID id) { return repository.findById(id); }
    @Override public Optional<ToolDefinition> findByName(String name) { return repository.findByName(name); }
    @Override public boolean existsByName(String name) { return repository.existsByName(name); }
    @Override public Page<ToolDefinition> findAll(Pageable pageable) { return repository.findAll(pageable); }
    @Override public Page<ToolDefinition> findByActiveTrue(Pageable pageable) { return repository.findByActiveTrue(pageable); }
    @Override public List<ToolDefinition> findByActiveTrueOrderByNameAsc() { return repository.findByActiveTrueOrderByNameAsc(); }
}
