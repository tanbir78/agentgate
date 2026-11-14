package com.agentgate.policy.infrastructure;

import com.agentgate.policy.application.PolicyRuleStore;
import com.agentgate.policy.domain.PolicyRule;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class PolicyRuleStoreAdapter implements PolicyRuleStore {

    private final PolicyRuleRepository repository;

    public PolicyRuleStoreAdapter(PolicyRuleRepository repository) {
        this.repository = repository;
    }

    @Override
    public PolicyRule save(PolicyRule rule) {
        return repository.save(rule);
    }

    @Override
    public List<PolicyRule> findEnabledByPolicyId(UUID policyId) {
        return repository
                .findByPolicy_IdAndEnabledTrueOrderByPriorityAscCreatedAtAsc(policyId);
    }

    @Override
    public List<PolicyRule> findByPolicyId(UUID policyId) {
        return repository.findByPolicy_Id(policyId);
    }

    @Override
    public boolean existsEnabledByPolicyId(UUID policyId) {
        return repository.existsByPolicy_IdAndEnabledTrue(policyId);
    }
}
