package com.agentgate.audit.application;

import com.agentgate.audit.domain.AuditEvent;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditEventStore store;

    public AuditService(AuditEventStore store) {
        this.store = store;
    }

    @Transactional
    public void record(
            String actor,
            UUID agent,
            UUID tool,
            String decision,
            String rule,
            String explanation) {

        store.save(createEvent(actor, agent, tool, decision, rule, explanation));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordIndependent(
            String actor,
            UUID agent,
            UUID tool,
            String decision,
            String rule,
            String explanation) {

        store.save(createEvent(actor, agent, tool, decision, rule, explanation));
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> list(Pageable pageable) {
        return store.findAll(pageable);
    }

    private AuditEvent createEvent(
            String actor,
            UUID agent,
            UUID tool,
            String decision,
            String rule,
            String explanation) {

        String safe = explanation == null
                ? ""
                : explanation.substring(0, Math.min(1000, explanation.length()));

        return new AuditEvent(
                actor,
                agent,
                tool,
                decision == null ? "UNKNOWN" : decision,
                rule,
                safe
        );
    }
}