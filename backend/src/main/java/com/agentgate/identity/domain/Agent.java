package com.agentgate.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agents")
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "client_id", nullable = false, unique = true, length = 100)
    private String clientId;

    @Column(name = "client_secret_hash", nullable = false, length = 100)
    private String clientSecretHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Clearance clearance;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private long version;

    protected Agent() { }

    public Agent(String name, String clientId, String clientSecretHash, Clearance clearance) {
        this.name = name;
        this.clientId = clientId;
        this.clientSecretHash = clientSecretHash;
        this.clearance = clearance;
        this.active = true;
    }

    @PrePersist
    void beforeInsert() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void beforeUpdate() { updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getClientId() { return clientId; }
    public String getClientSecretHash() { return clientSecretHash; }
    public Clearance getClearance() { return clearance; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void updateProfile(String name, Clearance clearance) {
        this.name = name;
        this.clearance = clearance;
    }

    public void setActive(boolean active) { this.active = active; }
}
