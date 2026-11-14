
package com.agentgate.policy;

import com.agentgate.identity.application.AgentStore;
import com.agentgate.identity.domain.Agent;
import com.agentgate.policy.application.DatabasePolicyDecisionProvider;
import com.agentgate.policy.application.PolicyDecisionProvider;
import com.agentgate.policy.application.PolicyRuleStore;
import com.agentgate.policy.application.PolicyStore;
import com.agentgate.policy.domain.Policy;
import com.agentgate.policy.domain.PolicyEffect;
import com.agentgate.policy.domain.PolicyRule;
import com.agentgate.registry.domain.ToolDefinition;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DatabasePolicyDecisionProviderTest {

    @Mock
    private AgentStore agentStore;

    @Mock
    private PolicyStore policyStore;

    @Mock
    private PolicyRuleStore ruleStore;

    @Mock
    private Agent agent;

    @Mock
    private ToolDefinition tool;

    @Mock
    private Policy policy;

    @Mock
    private PolicyRule rule;

    private DatabasePolicyDecisionProvider provider;

    private UUID agentId;
    private UUID toolId;
    private UUID policyId;
    private UUID ruleId;

    @BeforeEach
    void setUp() {
        provider = new DatabasePolicyDecisionProvider(
                agentStore,
                policyStore,
                ruleStore
        );

        agentId = UUID.randomUUID();
        toolId = UUID.randomUUID();
        policyId = UUID.randomUUID();
        ruleId = UUID.randomUUID();

        when(agentStore.findByClientId("agent-1"))
                .thenReturn(Optional.of(agent));

        when(agent.isActive()).thenReturn(true);
        when(agent.getId()).thenReturn(agentId);

        when(tool.getId()).thenReturn(toolId);
        when(tool.isActive()).thenReturn(true);

        when(policy.getId()).thenReturn(policyId);
    }

    private void prepareRule(PolicyEffect effect, Map<String, Object> conditions) {
        when(policyStore.findAllActivePolicies())
                .thenReturn(List.of(policy));

        when(ruleStore.findEnabledByPolicyId(policyId))
                .thenReturn(List.of(rule));

        when(rule.getAgentId()).thenReturn(agentId);
        when(rule.getToolId()).thenReturn(toolId);
        when(rule.getEffect()).thenReturn(effect);
        when(rule.getConditions()).thenReturn(conditions);
        when(rule.getPriority()).thenReturn(100);
        when(rule.getCreatedAt()).thenReturn(Instant.now());
        when(rule.getId()).thenReturn(ruleId);
    }

    @Test
    void allowsCallWhenMatchingAllowRuleExists() {
        prepareRule(PolicyEffect.ALLOW, Map.of());

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.ALLOW,
                decision.decision()
        );

        assertEquals(ruleId.toString(), decision.ruleId());
    }

    @Test
    void deniesCallWhenMatchingDenyRuleExists() {
        prepareRule(PolicyEffect.DENY, Map.of());

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.DENY,
                decision.decision()
        );

        assertEquals(ruleId.toString(), decision.ruleId());
    }

    @Test
    void requiresApprovalWhenApprovalRuleExists() {
        prepareRule(PolicyEffect.APPROVAL_REQUIRED, Map.of());

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.APPROVAL_REQUIRED,
                decision.decision()
        );

        assertEquals(ruleId.toString(), decision.ruleId());
    }

    @Test
    void deniesCallWhenNoMatchingRuleExists() {
        when(policyStore.findAllActivePolicies())
                .thenReturn(List.of());

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.DENY,
                decision.decision()
        );

        assertEquals("DEFAULT_DENY", decision.ruleId());
    }

    @Test
    void deniesCallWhenAgentIsInactive() {
        when(agent.isActive()).thenReturn(false);

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.DENY,
                decision.decision()
        );

        verifyNoInteractions(policyStore, ruleStore);
    }

    @Test
    void deniesCallWhenToolIsInactive() {
        when(tool.isActive()).thenReturn(false);

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.DENY,
                decision.decision()
        );

        verifyNoInteractions(agentStore, policyStore, ruleStore);
    }

    @Test
    void deniesCallWhenConditionsAreUnsupported() {
        prepareRule(
                PolicyEffect.ALLOW,
                Map.of("unknownCondition", true)
        );

        var decision = provider.evaluate(
                "agent-1",
                "user-1",
                tool,
                Map.of()
        );

        assertEquals(
                PolicyDecisionProvider.Decision.DENY,
                decision.decision()
        );

        assertEquals("DEFAULT_DENY", decision.ruleId());
    }
}

