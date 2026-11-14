package com.agentgate.policy.application;

import com.agentgate.registry.domain.ToolDefinition;
import java.util.Map;

/** Port implemented by the policy module in Stage 7. */
public interface PolicyDecisionProvider {
    PolicyDecision evaluate(String agentClientId, String endUserId, ToolDefinition tool, Map<String, Object> arguments);
    boolean canDiscover(String agentClientId, ToolDefinition tool);

    record PolicyDecision(Decision decision, String ruleId, String explanation) { }
    enum Decision { ALLOW, DENY, APPROVAL_REQUIRED }
}
