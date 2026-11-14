package com.agentgate.approval.presentation;

import com.agentgate.approval.application.ApprovalService;
import com.agentgate.approval.application.ApprovalDtos.ApprovalResponse;
import com.agentgate.approval.application.ApprovalDtos.DecisionRequest;
import com.agentgate.approval.domain.ApprovalStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/approvals")
public class ApprovalController {
    private final ApprovalService service;

    public ApprovalController(ApprovalService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApprovalResponse> list(
            @RequestParam(defaultValue = "PENDING") ApprovalStatus status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public ApprovalResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping("/{id}/approve")
    public ApprovalResponse approve(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) DecisionRequest request,
            Authentication authentication) {

        ApprovalResponse response = service.approve(
                id, authentication.getName(), request == null ? null : request.reason());

        return requireNonExpired(response);
    }

    @PostMapping("/{id}/reject")
    public ApprovalResponse reject(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) DecisionRequest request,
            Authentication authentication) {

        ApprovalResponse response = service.reject(
                id, authentication.getName(), request == null ? null : request.reason());

        return requireNonExpired(response);
    }

    private ApprovalResponse requireNonExpired(ApprovalResponse response) {
        if (response.status() == ApprovalStatus.EXPIRED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Approval request has expired.");
        }
        return response;
    }
}