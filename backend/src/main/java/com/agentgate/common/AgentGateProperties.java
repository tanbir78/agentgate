package com.agentgate.common;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Typed application configuration. Secrets are supplied only through environment variables. */
@Validated
@ConfigurationProperties(prefix = "agentgate")
public record AgentGateProperties(
        @NotBlank @Size(min = 32) String auditCheckpointSecret,
        @NotBlank String jwtPrivateKeyBase64,
        @NotBlank String jwtPublicKeyBase64,
        @NotBlank @Size(min = 32) String delegationSigningSecret,
        @NotBlank String issuer,
        @NotBlank String adminUsername,
        @NotBlank String adminPassword,
        @Min(1) int policyRefreshSeconds,
        @Min(1) int approvalDefaultExpiryMinutes,
        @Min(1) int accessTokenMinutes) {
}
