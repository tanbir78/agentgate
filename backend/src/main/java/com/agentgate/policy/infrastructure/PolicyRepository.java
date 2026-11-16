package com.agentgate.policy.infrastructure;

import com.agentgate.policy.domain.Policy;
import com.agentgate.policy.domain.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PolicyRepository extends JpaRepository<Policy, UUID> {

    List<Policy> findAllByOrderByCreatedAtDesc();

    Optional<Policy> findByPolicyKeyAndStatus(
            String policyKey,
            PolicyStatus status
    );

    Optional<Policy> findTopByPolicyKeyOrderByVersionDesc(
            String policyKey
    );

    List<Policy> findAllByStatusOrderByPolicyKeyAscVersionDesc(
            PolicyStatus status
    );

    boolean existsByPolicyKeyAndVersion(
            String policyKey,
            int version
    );
}