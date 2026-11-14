package com.agentgate.policy.application;

import com.agentgate.policy.domain.PolicyEffect;
import com.agentgate.policy.domain.PolicyStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public final class PolicyDtos {

    private PolicyDtos() {
    }

    public record CreatePolicyRequest(
            @NotBlank
            @Size(max = 120)
            @Pattern(
                regexp = "[a-zA-Z][a-zA-Z0-9_-]{1,119}",
                message = "policyKey must start with a letter"
            )
            String policyKey,

            @Size(max = 1000)
            String description
    ) {
    }

    public record AddPolicyRuleRequest(
            @NotNull
            UUID agentId,

            @NotNull
            UUID toolId,

            @NotNull
            PolicyEffect effect,

            @Min(0)
            @Max(10000)
            int priority,

            Map<String, Object> conditions,

            @Size(max = 1000)
            String description
    ) {
    }

    public record PolicyResponse(
            UUID id,
            String policyKey,
            int version,
            String description,
            PolicyStatus status,
            Instant createdAt,
            Instant activatedAt
    ) {
    }

    public record PolicyRuleResponse(
            UUID id,
            UUID policyId,
            UUID agentId,
            UUID toolId,
            PolicyEffect effect,
            int priority,
            Map<String, Object> conditions,
            boolean enabled,
            String description,
            Instant createdAt
    ) {
    }
}
