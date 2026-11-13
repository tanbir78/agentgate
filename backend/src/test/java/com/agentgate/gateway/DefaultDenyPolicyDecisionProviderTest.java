package com.agentgate.gateway;

import com.agentgate.gateway.application.DefaultDenyPolicyDecisionProvider;
import com.agentgate.gateway.application.PolicyDecisionProvider;
import com.agentgate.registry.domain.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DefaultDenyPolicyDecisionProviderTest {
    @Test
    void deniesCallsAndHidesToolsUntilPolicyModuleExists() {
        var provider = new DefaultDenyPolicyDecisionProvider();
        var tool = new ToolDefinition("customer_lookup", "Lookup", ToolTransport.REST, RiskLevel.LOW,
                "support", "https://example.test/customer", "GET", java.util.Map.of("type", "object"));
        var decision = provider.evaluate("agent-1", "customer-1", tool, java.util.Map.of());
        assertEquals(PolicyDecisionProvider.Decision.DENY, decision.decision());
        assertFalse(provider.canDiscover("agent-1", tool));
    }
}
