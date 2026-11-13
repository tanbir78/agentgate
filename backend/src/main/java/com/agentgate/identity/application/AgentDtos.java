package com.agentgate.identity.application;

import com.agentgate.identity.domain.Clearance;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AgentDtos {
    private AgentDtos() { }

    public record CreateAgentRequest(
            @NotBlank @Size(max = 120) String name,
            @NotNull Clearance clearance) { }

    public record UpdateAgentRequest(
            @NotBlank @Size(max = 120) String name,
            @NotNull Clearance clearance,
            boolean active) { }

    public record CreatedAgentResponse(
            UUID id, String name, String clientId, String clientSecret,
            Clearance clearance, boolean active, Instant createdAt) { }

    public record AgentResponse(
            UUID id, String name, String clientId, Clearance clearance,
            boolean active, Instant createdAt, Instant updatedAt) { }
}
