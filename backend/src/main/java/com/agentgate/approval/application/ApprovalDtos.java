package com.agentgate.approval.application;

import com.agentgate.approval.domain.ApprovalStatus;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ApprovalDtos {
    private ApprovalDtos() {}

    public record DecisionRequest(
            @Size(max = 1000) String reason) {}

    public record ApprovalResponse(
            UUID id,
            UUID agentId,
            UUID toolId,
            UUID policyRuleId,
            String endUserId,
            String argumentsSha256,
            ApprovalStatus status,
            Instant requestedAt,
            Instant expiresAt,
            Instant decidedAt,
            String decidedBy,
            String decisionReason,
            long version) {}
}