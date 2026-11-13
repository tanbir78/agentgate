package com.agentgate.registry.application;

import com.agentgate.registry.domain.RiskLevel;
import com.agentgate.registry.domain.ToolHealth;
import com.agentgate.registry.domain.ToolTransport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ToolDtos {
    private ToolDtos() { }
    public record CreateToolRequest(
            @NotBlank @Size(max = 120) @jakarta.validation.constraints.Pattern(regexp = "[a-zA-Z][a-zA-Z0-9_-]{1,119}") String name,
            @NotBlank @Size(max = 1000) String description,
            @NotNull ToolTransport transportType,
            @NotNull RiskLevel riskLevel,
            @NotBlank @Size(max = 120) String ownerTeam,
            @NotBlank @Size(max = 2048) @Pattern(regexp = "https?://.+", message = "endpointUrl must use http or https") String endpointUrl,
            @Size(max = 10) String httpMethod,
            @NotBlank String inputSchema) { }
    public record UpdateToolRequest(
            @NotBlank @Size(max = 1000) String description,
            @NotNull RiskLevel riskLevel,
            @NotBlank @Size(max = 120) String ownerTeam,
            @NotBlank @Size(max = 2048) @Pattern(regexp = "https?://.+") String endpointUrl,
            @Size(max = 10) String httpMethod,
            @NotBlank String inputSchema,
            boolean active) { }
    public record ToolResponse(UUID id, String name, String description, ToolTransport transportType,
            RiskLevel riskLevel, String ownerTeam, String endpointUrl, String httpMethod,
            String inputSchema, boolean active, ToolHealth healthStatus, Instant createdAt, Instant updatedAt) { }
}
