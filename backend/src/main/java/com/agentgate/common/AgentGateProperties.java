package com.agentgate.common;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Typed, validated configuration (C2). Startup fails if required secrets are missing,
 * so no secret has a committed default.
 */
@Validated
@ConfigurationProperties(prefix = "agentgate")
public record AgentGateProperties(
        @NotBlank String auditCheckpointSecret,
        @Min(1) int policyRefreshSeconds,
        @Min(1) int approvalDefaultExpiryMinutes) {
}
