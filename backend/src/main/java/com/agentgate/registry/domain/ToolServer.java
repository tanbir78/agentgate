package com.agentgate.registry.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tool_servers")
public class ToolServer {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 120)
    private String name;
    @Enumerated(EnumType.STRING) @Column(name = "transport_type", nullable = false, length = 20)
    private ToolTransport transportType;
    @Column(name = "base_url", nullable = false, length = 2048)
    private String baseUrl;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ToolServer() { }
    public ToolServer(String name, ToolTransport transportType, String baseUrl) {
        this.name = name; this.transportType = transportType; this.baseUrl = baseUrl;
    }
    @PrePersist void beforeInsert() { createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public ToolTransport getTransportType() { return transportType; }
    public String getBaseUrl() { return baseUrl; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public void deactivate() { active = false; }
}
