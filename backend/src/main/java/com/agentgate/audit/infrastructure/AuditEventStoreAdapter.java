package com.agentgate.audit.infrastructure;

import com.agentgate.audit.application.AuditEventStore;
import com.agentgate.audit.domain.AuditEvent;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class AuditEventStoreAdapter implements AuditEventStore {

    private final AuditEventRepository repository;

    public AuditEventStoreAdapter(AuditEventRepository repository) {
        this.repository = repository;
    }

    @Override
    public AuditEvent save(AuditEvent event) {
        return repository.save(event);
    }

    @Override
    public Page<AuditEvent> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
}