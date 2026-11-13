package com.agentgate.gateway.application;

import com.agentgate.registry.domain.ToolDefinition;
import java.util.Map;

/** Safe bootstrap policy. Replaced by the versioned policy evaluator in Stage 7. */
public class DefaultDenyPolicyDecisionProvider implements PolicyDecisionProvider {
    @Override
    public PolicyDecision evaluate(String agentClientId, String endUserId, ToolDefinition tool, Map<String, Object> arguments) {
        return new PolicyDecision(Decision.DENY, "DEFAULT_DENY", "No active policy rule authorizes this call yet.");
    }

    @Override
    public boolean canDiscover(String agentClientId, ToolDefinition tool) {
        return false;
    }
}
