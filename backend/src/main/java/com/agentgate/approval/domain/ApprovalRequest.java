package com.agentgate.approval.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "approval_requests")
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    @Column(name = "tool_id", nullable = false)
    private UUID toolId;

    @Column(name = "policy_rule_id", nullable = false)
    private UUID policyRuleId;

    @Column(name = "end_user_id", length = 255)
    private String endUserId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> arguments = Map.of();

    @Column(name = "arguments_sha256", nullable = false, length = 64)
    private String argumentsSha256;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "decided_by", length = 120)
    private String decidedBy;

    @Column(name = "decision_reason", length = 1000)
    private String decisionReason;

    @Version
    private long version;

    protected ApprovalRequest() {
    }

    public ApprovalRequest(
            UUID agentId,
            UUID toolId,
            UUID policyRuleId,
            String endUserId,
            Map<String, Object> arguments,
            String argumentsSha256,
            Instant expiresAt) {

        this.agentId = agentId;
        this.toolId = toolId;
        this.policyRuleId = policyRuleId;
        this.endUserId = endUserId;
        this.arguments = arguments == null ? Map.of() : Map.copyOf(arguments);
        this.argumentsSha256 = argumentsSha256;
        this.expiresAt = expiresAt;
        this.status = ApprovalStatus.PENDING;
    }

    @PrePersist
    void beforeInsert() {
        requestedAt = Instant.now();
    }

    public void approve(String approver, String reason) {
        decide(ApprovalStatus.APPROVED, approver, reason);
    }

    public void reject(String approver, String reason) {
        decide(ApprovalStatus.REJECTED, approver, reason);
    }

    public void expire() {
        if (status != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can expire.");
        }
        if (Instant.now().isBefore(expiresAt)) {
            throw new IllegalStateException("Approval request has not expired.");
        }
        status = ApprovalStatus.EXPIRED;
        decidedAt = Instant.now();
        decidedBy = "SYSTEM";
    }

    private void decide(ApprovalStatus decision, String approver, String reason) {
        if (status != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be decided.");
        }
        if (!Instant.now().isBefore(expiresAt)) {
            expire();
            return;
        }
        if (approver == null || approver.isBlank()) {
            throw new IllegalArgumentException("Approver identity is required.");
        }

        status = decision;
        decidedAt = Instant.now();
        decidedBy = approver;
        decisionReason = reason;
    }

    public UUID getId() { return id; }
    public UUID getAgentId() { return agentId; }
    public UUID getToolId() { return toolId; }
    public UUID getPolicyRuleId() { return policyRuleId; }
    public String getEndUserId() { return endUserId; }
    public Map<String, Object> getArguments() { return arguments; }
    public String getArgumentsSha256() { return argumentsSha256; }
    public ApprovalStatus getStatus() { return status; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getDecidedAt() { return decidedAt; }
    public String getDecidedBy() { return decidedBy; }
    public String getDecisionReason() { return decisionReason; }
    public long getVersion() { return version; }
}