package com.agentgate.identity.application;

import com.agentgate.common.AgentGateProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

/** Validates end-user delegation signed by a trusted upstream identity broker. */
@Component
public class DelegationIdentityResolver {
    private final byte[] signingKey;
    public DelegationIdentityResolver(AgentGateProperties properties) {
        this.signingKey = properties.delegationSigningSecret().getBytes(StandardCharsets.UTF_8);
    }

    public Optional<String> resolve(String agentClientId, String endUserId, String signature) {
        if ((endUserId == null || endUserId.isBlank()) && (signature == null || signature.isBlank())) return Optional.empty();
        if (endUserId == null || endUserId.isBlank() || signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Both end-user identity and delegation signature are required");
        }
        if (endUserId.length() > 256) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End-user identifier is too long");
        String payload = agentClientId + ":" + endUserId;
        String expected = sign(payload);
        boolean valid = MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        if (!valid) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid end-user delegation signature");
        return Optional.of(endUserId);
    }

    /** Used by trusted integration tests and upstream identity-broker implementations. */
    public String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(signingKey, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign delegation identity", exception);
        }
    }
}
