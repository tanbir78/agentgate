package com.agentgate.identity;

import com.agentgate.common.AgentGateProperties;
import com.agentgate.identity.application.DelegationIdentityResolver;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class DelegationIdentityResolverTest {
    private final DelegationIdentityResolver resolver = new DelegationIdentityResolver(new AgentGateProperties(
            "audit-secret-value-that-is-at-least-32-characters",
            "base64-private-key-placeholder",
            "base64-public-key-placeholder",
            "delegation-secret-value-that-is-at-least-32-characters",
            "http://localhost:8080", "admin", "admin-password", 5, 30, 15));

    @Test
    void acceptsAValidSignedDelegation() {
        String agentId = "ag_client_1";
        String userId = "customer-42";
        String signature = resolver.sign(agentId + ":" + userId);
        assertEquals(userId, resolver.resolve(agentId, userId, signature).orElseThrow());
    }

    @Test
    void rejectsAChangedUserId() {
        String signature = resolver.sign("ag_client_1:customer-42");
        assertThrows(ResponseStatusException.class,
                () -> resolver.resolve("ag_client_1", "customer-43", signature));
    }

    @Test
    void allowsNoDelegatedUser() {
        assertTrue(resolver.resolve("ag_client_1", null, null).isEmpty());
    }
}
