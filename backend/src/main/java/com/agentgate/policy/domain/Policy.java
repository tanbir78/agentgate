package com.agentgate.policy.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "policies",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_policy_key_version",
        columnNames = {"policy_key", "version"}
    )
)
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "policy_key", nullable = false, length = 120)
    private String policyKey;

    @Column(nullable = false)
    private int version;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PolicyStatus status = PolicyStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "activated_at")
    private Instant activatedAt;

    protected Policy() {
    }

    public Policy(String policyKey, int version, String description) {
        this.policyKey = policyKey;
        this.version = version;
        this.description = description;
        this.status = PolicyStatus.DRAFT;
    }

    @PrePersist
    void beforeInsert() {
        createdAt = Instant.now();
    }

    public void activate() {
        this.status = PolicyStatus.ACTIVE;
        this.activatedAt = Instant.now();
    }

    public void archive() {
        this.status = PolicyStatus.ARCHIVED;
    }

    public UUID getId() {
        return id;
    }

    public String getPolicyKey() {
        return policyKey;
    }

    public int getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public PolicyStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getActivatedAt() {
        return activatedAt;
    }
}
