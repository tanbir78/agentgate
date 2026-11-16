package com.agentgate.audit.presentation;

import com.agentgate.audit.domain.AuditEvent;

import java.time.Instant;
import java.util.UUID;

public record AuditEventResponse(
        UUID id,
        Instant occurredAt,
        String actorId,
        UUID agentId,
        UUID toolId,
        String decision,
        String ruleId,
        String explanation
) {
    public static AuditEventResponse from(AuditEvent event) {
        return new AuditEventResponse(
                event.getId(),
                event.getOccurredAt(),
                event.getActorId(),
                event.getAgentId(),
                event.getToolId(),
                event.getDecision(),
                event.getRuleId(),
                event.getExplanation()
        );
    }
}