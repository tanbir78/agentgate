package com.agentgate.policy.infrastructure;

import com.agentgate.policy.application.PolicyStore;
import com.agentgate.policy.domain.Policy;
import com.agentgate.policy.domain.PolicyStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PolicyStoreAdapter implements PolicyStore {

    private final PolicyRepository repository;

    public PolicyStoreAdapter(PolicyRepository repository) {
        this.repository = repository;
    }

    @Override
    public Policy save(Policy policy) {
        return repository.save(policy);
    }

    @Override
    public Optional<Policy> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Policy> findByPolicyKeyAndStatus(
            String policyKey, PolicyStatus status) {
        return repository.findByPolicyKeyAndStatus(policyKey, status);
    }

    @Override
    public Optional<Policy> findLatestByPolicyKey(String policyKey) {
        return repository.findTopByPolicyKeyOrderByVersionDesc(policyKey);
    }

    @Override
    public List<Policy> findAllActivePolicies() {
        return repository.findAllByStatusOrderByPolicyKeyAscVersionDesc(
                PolicyStatus.ACTIVE
        );
    }

    @Override
    public List<Policy> findAllPolicies() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public boolean existsByPolicyKeyAndVersion(String policyKey, int version) {
        return repository.existsByPolicyKeyAndVersion(policyKey, version);
    }
}