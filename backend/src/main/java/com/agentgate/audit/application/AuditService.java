package com.agentgate.audit.application;
import com.agentgate.audit.domain.AuditEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service
public class AuditService {
 private final AuditEventStore store;
 public AuditService(AuditEventStore store){this.store=store;}
 @Transactional
 public void record(String actor, UUID agent, UUID tool, String decision, String rule, String explanation){
  String safe=explanation==null?"":explanation.substring(0,Math.min(1000,explanation.length()));
  store.save(new AuditEvent(actor,agent,tool,decision==null?"UNKNOWN":decision,rule,safe));
 }
}