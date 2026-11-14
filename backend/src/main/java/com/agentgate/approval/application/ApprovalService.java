package com.agentgate.approval.application;

import com.agentgate.approval.domain.ApprovalRequest;
import com.agentgate.approval.domain.ApprovalStatus;
import com.agentgate.audit.application.AuditService;
import com.agentgate.common.AgentGateProperties;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.agentgate.approval.application.ApprovalDtos.*;

@Service
public class ApprovalService {

    private final ApprovalStore repository;
    private final AgentGateProperties properties;
    private final JsonMapper jsonMapper;
    private final AuditService auditService;

    public ApprovalService(
            ApprovalStore repository,
            AgentGateProperties properties,
            JsonMapper jsonMapper,
            AuditService auditService) {
        this.repository = repository;
        this.properties = properties;
        this.jsonMapper = jsonMapper;
        this.auditService = auditService;
    }

    @Transactional
    public ApprovalResponse create(
            UUID agentId,
            UUID toolId,
            UUID policyRuleId,
            String endUserId,
            Map<String, Object> arguments) {

        if (agentId == null || toolId == null || policyRuleId == null) {
            throw new IllegalArgumentException("Approval identity fields are required.");
        }

        if (endUserId == null || endUserId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Verified requester identity is required for approval requests.");
        }

        Map<String, Object> safeArguments =
                arguments == null ? Map.of() : arguments;

        Instant expiry = Instant.now().plus(
                properties.approvalDefaultExpiryMinutes(), ChronoUnit.MINUTES);

        ApprovalRequest request = new ApprovalRequest(
                agentId,
                toolId,
                policyRuleId,
                endUserId,
                safeArguments,
                hashArguments(safeArguments),
                expiry);

        return toResponse(repository.save(request));
    }

    @Transactional(readOnly = true)
    public List<ApprovalResponse> list(ApprovalStatus status) {
        return repository.findAllByStatusOrderByRequestedAtDesc(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApprovalResponse get(UUID id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Approval request not found.")));
    }

    @Transactional
    public ApprovalResponse approve(UUID id, String approver, String reason) {
        ApprovalRequest request = findForDecision(id);
        enforceFourEyes(request, approver, "SELF_APPROVAL_BLOCKED");

        try {
            request.approve(approver, reason);
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, exception.getMessage());
        }

        ApprovalRequest saved = repository.save(request);

        if (saved.getStatus() == ApprovalStatus.EXPIRED) {
            recordExpired(saved);
            return toResponse(saved);
        }

        auditService.record(
                approver,
                saved.getAgentId(),
                saved.getToolId(),
                "APPROVED",
                saved.getPolicyRuleId().toString(),
                "Approval approved: " + saved.getId()
        );

        return toResponse(saved);
    }

    @Transactional
    public ApprovalResponse reject(UUID id, String approver, String reason) {
        ApprovalRequest request = findForDecision(id);
        enforceFourEyes(request, approver, "SELF_REJECTION_BLOCKED");

        try {
            request.reject(approver, reason);
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, exception.getMessage());
        }

        ApprovalRequest saved = repository.save(request);

        if (saved.getStatus() == ApprovalStatus.EXPIRED) {
            recordExpired(saved);
            return toResponse(saved);
        }

        auditService.record(
                approver,
                saved.getAgentId(),
                saved.getToolId(),
                "REJECTED",
                saved.getPolicyRuleId().toString(),
                "Approval rejected: " + saved.getId()
        );

        return toResponse(saved);
    }

    private void enforceFourEyes(
            ApprovalRequest request,
            String approver,
            String blockedDecision) {

        String requester = request.getEndUserId();

        if (requester == null || requester.isBlank()) {
            auditService.recordIndependent(
                    approver,
                    request.getAgentId(),
                    request.getToolId(),
                    "REQUESTER_IDENTITY_MISSING",
                    request.getPolicyRuleId().toString(),
                    "Decision blocked because requester identity is missing: " + request.getId()
            );

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Cannot decide an approval without a verified requester identity.");
        }

        if (requester.equals(properties.adminIdentity())) {
            auditService.recordIndependent(
                    approver,
                    request.getAgentId(),
                    request.getToolId(),
                    blockedDecision,
                    request.getPolicyRuleId().toString(),
                    "Four-Eyes Principle blocked self-decision: " + request.getId()
            );

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "The requester cannot approve or reject their own request.");
        }
    }

    private void recordExpired(ApprovalRequest request) {
        auditService.record(
                "SYSTEM",
                request.getAgentId(),
                request.getToolId(),
                "EXPIRED",
                request.getPolicyRuleId().toString(),
                "Approval request expired: " + request.getId()
        );
    }

    private ApprovalRequest findForDecision(UUID id) {
        return repository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Approval request not found."));
    }

    private String hashArguments(Map<String, Object> arguments) {
        try {
            byte[] serialized = jsonMapper.writeValueAsBytes(arguments);
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(serialized);
            return HexFormat.of().formatHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to calculate approval argument hash.", exception);
        }
    }

    private ApprovalResponse toResponse(ApprovalRequest request) {
        return new ApprovalResponse(
                request.getId(),
                request.getAgentId(),
                request.getToolId(),
                request.getPolicyRuleId(),
                request.getEndUserId(),
                request.getArgumentsSha256(),
                request.getStatus(),
                request.getRequestedAt(),
                request.getExpiresAt(),
                request.getDecidedAt(),
                request.getDecidedBy(),
                request.getDecisionReason(),
                request.getVersion());
    }
}
