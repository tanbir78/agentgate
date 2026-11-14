package com.agentgate.approval.infrastructure;

import com.agentgate.approval.application.ApprovalStore;
import com.agentgate.approval.domain.ApprovalRequest;
import com.agentgate.approval.domain.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApprovalRepository
        extends JpaRepository<ApprovalRequest, UUID>, ApprovalStore {

    Optional<ApprovalRequest> findByIdAndStatus(UUID id, ApprovalStatus status);

    @Override
    List<ApprovalRequest> findAllByStatusOrderByRequestedAtDesc(ApprovalStatus status);

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select request from ApprovalRequest request where request.id = :id")
    Optional<ApprovalRequest> findByIdForUpdate(@Param("id") UUID id);
}