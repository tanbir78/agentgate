package com.agentgate.audit.infrastructure;
import com.agentgate.audit.application.AuditEventStore;
import com.agentgate.audit.domain.AuditEvent;
import org.springframework.stereotype.Component;
@Component
public class AuditEventStoreAdapter implements AuditEventStore {
 private final AuditEventRepository repository;
 public AuditEventStoreAdapter(AuditEventRepository repository){this.repository=repository;}
 public AuditEvent save(AuditEvent event){return repository.save(event);}
}