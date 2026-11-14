package com.agentgate.policy.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "policy_rules")
public class PolicyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(name = "agent_id")
    private UUID agentId;

    @Column(name = "tool_id")
    private UUID toolId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PolicyEffect effect;

    @Column(nullable = false)
    private int priority = 100;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> conditions = Map.of();

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(length = 1000)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PolicyRule() {
    }

    public PolicyRule(
            Policy policy,
            UUID agentId,
            UUID toolId,
            PolicyEffect effect,
            int priority,
            Map<String, Object> conditions,
            String description) {

        this.policy = policy;
        this.agentId = agentId;
        this.toolId = toolId;
        this.effect = effect;
        this.priority = priority;
        this.conditions = conditions == null ? Map.of() : Map.copyOf(conditions);
        this.description = description;
        this.enabled = true;
    }

    @PrePersist
    void beforeInsert() {
        createdAt = Instant.now();
    }

    public void disable() {
        this.enabled = false;
    }

    public UUID getId() {
        return id;
    }

    public Policy getPolicy() {
        return policy;
    }

    public UUID getAgentId() {
        return agentId;
    }

    public UUID getToolId() {
        return toolId;
    }

    public PolicyEffect getEffect() {
        return effect;
    }

    public int getPriority() {
        return priority;
    }

    public Map<String, Object> getConditions() {
        return conditions;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
