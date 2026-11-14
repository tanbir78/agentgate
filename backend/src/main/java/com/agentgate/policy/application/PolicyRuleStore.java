package com.agentgate.policy.application;

import com.agentgate.policy.domain.PolicyRule;

import java.util.List;
import java.util.UUID;

public interface PolicyRuleStore {

    PolicyRule save(PolicyRule rule);

    List<PolicyRule> findEnabledByPolicyId(UUID policyId);

    List<PolicyRule> findByPolicyId(UUID policyId);

    boolean existsEnabledByPolicyId(UUID policyId);
}
