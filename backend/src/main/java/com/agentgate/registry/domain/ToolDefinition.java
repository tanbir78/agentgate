package com.agentgate.registry.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tools")
public class ToolDefinition {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 120)
    private String name;
    @Column(nullable = false, length = 1000)
    private String description;
    @Enumerated(EnumType.STRING) @Column(name = "transport_type", nullable = false, length = 20)
    private ToolTransport transportType;
    @Enumerated(EnumType.STRING) @Column(name = "risk_level", nullable = false, length = 20)
    private RiskLevel riskLevel;
    @Column(name = "owner_team", nullable = false, length = 120)
    private String ownerTeam;
    @Column(name = "endpoint_url", nullable = false, length = 2048)
    private String endpointUrl;
    @Column(name = "http_method", length = 10)
    private String httpMethod;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_schema", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> inputSchema;
    @Column(nullable = false)
    private boolean active = true;
    @Enumerated(EnumType.STRING) @Column(name = "health_status", nullable = false, length = 20)
    private ToolHealth healthStatus = ToolHealth.UNKNOWN;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @Version private long version;

    protected ToolDefinition() { }

    public ToolDefinition(String name, String description, ToolTransport transportType, RiskLevel riskLevel,
                          String ownerTeam, String endpointUrl, String httpMethod, Map<String, Object> inputSchema) {
        this.name = name; this.description = description; this.transportType = transportType;
        this.riskLevel = riskLevel; this.ownerTeam = ownerTeam; this.endpointUrl = endpointUrl;
        this.httpMethod = httpMethod; this.inputSchema = inputSchema;
    }

    @PrePersist void beforeInsert() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void beforeUpdate() { updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public ToolTransport getTransportType() { return transportType; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public String getOwnerTeam() { return ownerTeam; }
    public String getEndpointUrl() { return endpointUrl; }
    public String getHttpMethod() { return httpMethod; }
    public Map<String, Object> getInputSchema() { return inputSchema; }
    public boolean isActive() { return active; }
    public ToolHealth getHealthStatus() { return healthStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void update(String description, RiskLevel riskLevel, String ownerTeam, String endpointUrl,
                       String httpMethod, Map<String, Object> inputSchema, boolean active) {
        this.description = description; this.riskLevel = riskLevel; this.ownerTeam = ownerTeam;
        this.endpointUrl = endpointUrl; this.httpMethod = httpMethod; this.inputSchema = inputSchema;
        this.active = active;
    }

    public void updateHealth(ToolHealth healthStatus) { this.healthStatus = healthStatus; }
}
