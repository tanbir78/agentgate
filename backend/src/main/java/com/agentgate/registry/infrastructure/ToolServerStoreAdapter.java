package com.agentgate.registry.infrastructure;

import com.agentgate.registry.application.ToolServerStore;
import com.agentgate.registry.domain.ToolServer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ToolServerStoreAdapter implements ToolServerStore {
    private final ToolServerRepository repository;
    public ToolServerStoreAdapter(ToolServerRepository repository) { this.repository = repository; }
    @Override public ToolServer save(ToolServer server) { return repository.save(server); }
    @Override public Optional<ToolServer> findById(UUID id) { return repository.findById(id); }
    @Override public boolean existsByName(String name) { return repository.existsByName(name); }
    @Override public Page<ToolServer> findAll(Pageable pageable) { return repository.findAll(pageable); }
}
