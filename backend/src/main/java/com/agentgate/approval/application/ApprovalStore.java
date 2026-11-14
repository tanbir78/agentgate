package com.agentgate.approval.application;

import com.agentgate.approval.domain.ApprovalRequest;
import com.agentgate.approval.domain.ApprovalStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApprovalStore {
    ApprovalRequest save(ApprovalRequest request);
    Optional<ApprovalRequest> findById(UUID id);
    Optional<ApprovalRequest> findByIdForUpdate(UUID id);
    List<ApprovalRequest> findAllByStatusOrderByRequestedAtDesc(ApprovalStatus status);
}