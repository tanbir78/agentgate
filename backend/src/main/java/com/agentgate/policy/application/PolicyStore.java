package com.agentgate.policy.application;

import com.agentgate.policy.domain.Policy;
import com.agentgate.policy.domain.PolicyStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PolicyStore {

    Policy save(Policy policy);

    Optional<Policy> findById(UUID id);

    Optional<Policy> findByPolicyKeyAndStatus(
            String policyKey,
            PolicyStatus status
    );

    Optional<Policy> findLatestByPolicyKey(String policyKey);

    List<Policy> findAllActivePolicies();

    List<Policy> findAllPolicies();

    boolean existsByPolicyKeyAndVersion(String policyKey, int version);
}