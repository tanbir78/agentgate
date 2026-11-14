package com.agentgate.policy.infrastructure;

import com.agentgate.policy.domain.PolicyRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PolicyRuleRepository extends JpaRepository<PolicyRule, UUID> {

    List<PolicyRule> findByPolicy_IdAndEnabledTrueOrderByPriorityAscCreatedAtAsc(
            UUID policyId
    );

    List<PolicyRule> findByPolicy_Id(UUID policyId);

    boolean existsByPolicy_IdAndEnabledTrue(UUID policyId);
}
