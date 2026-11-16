package com.agentgate.audit.application;

import com.agentgate.audit.domain.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditEventStore {

    AuditEvent save(AuditEvent event);

    Page<AuditEvent> findAll(Pageable pageable);
}