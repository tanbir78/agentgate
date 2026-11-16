package com.agentgate.audit.application;

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
) {}