package com.agentgate.approval.application;

import com.agentgate.approval.domain.ApprovalRequest;
import com.agentgate.approval.domain.ApprovalStatus;
import com.agentgate.audit.application.AuditService;
import com.agentgate.common.AgentGateProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApprovalServiceTest {

    private ApprovalStore repository;
    private AgentGateProperties properties;
    private JsonMapper jsonMapper;
    private AuditService auditService;
    private ApprovalService service;

    private static final String ADMIN_IDENTITY = "admin@example.test";

    @BeforeEach
    void setUp() {
        repository = mock(ApprovalStore.class);
        properties = mock(AgentGateProperties.class);
        jsonMapper = mock(JsonMapper.class);
        auditService = mock(AuditService.class);

        when(properties.adminIdentity()).thenReturn(ADMIN_IDENTITY);

        service = new ApprovalService(
                repository, properties, jsonMapper, auditService);
    }

    private ApprovalRequest expiredRequest() {
        return new ApprovalRequest(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "test-user", Map.of("amount", 100),
                "a".repeat(64), Instant.now().minusSeconds(60));
    }

    private ApprovalRequest pendingRequest(String requester) {
        return new ApprovalRequest(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                requester, Map.of("amount", 100),
                "a".repeat(64), Instant.now().plusSeconds(600));
    }

    @Test
    void expiredApprovalMustBeAuditedAsExpired() {
        UUID id = UUID.randomUUID();
        ApprovalRequest request = expiredRequest();

        when(repository.findByIdForUpdate(id)).thenReturn(Optional.of(request));
        when(repository.save(any(ApprovalRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.approve(id, "admin", "Late approval");

        assertEquals(ApprovalStatus.EXPIRED, response.status());
        verify(repository).save(request);
        verify(auditService).record(
                eq("SYSTEM"), eq(request.getAgentId()), eq(request.getToolId()),
                eq("EXPIRED"), eq(request.getPolicyRuleId().toString()), anyString());
        verify(auditService, never()).record(
                anyString(), any(), any(), eq("APPROVED"), anyString(), anyString());
    }

    @Test
    void expiredRejectionMustBeAuditedAsExpired() {
        UUID id = UUID.randomUUID();
        ApprovalRequest request = expiredRequest();

        when(repository.findByIdForUpdate(id)).thenReturn(Optional.of(request));
        when(repository.save(any(ApprovalRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.reject(id, "admin", "Late rejection");

        assertEquals(ApprovalStatus.EXPIRED, response.status());
        verify(repository).save(request);
        verify(auditService).record(
                eq("SYSTEM"), eq(request.getAgentId()), eq(request.getToolId()),
                eq("EXPIRED"), eq(request.getPolicyRuleId().toString()), anyString());
        verify(auditService, never()).record(
                anyString(), any(), any(), eq("REJECTED"), anyString(), anyString());
    }

    @Test
    void requesterMustNotApproveOwnRequest() {
        UUID id = UUID.randomUUID();
        ApprovalRequest request = pendingRequest(ADMIN_IDENTITY);
        when(repository.findByIdForUpdate(id)).thenReturn(Optional.of(request));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.approve(id, "admin", "Self approval"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(repository, never()).save(any());
        verify(auditService).recordIndependent(
                eq("admin"), eq(request.getAgentId()), eq(request.getToolId()),
                eq("SELF_APPROVAL_BLOCKED"),
                eq(request.getPolicyRuleId().toString()), anyString());
    }

    @Test
    void requesterMustNotRejectOwnRequest() {
        UUID id = UUID.randomUUID();
        ApprovalRequest request = pendingRequest(ADMIN_IDENTITY);
        when(repository.findByIdForUpdate(id)).thenReturn(Optional.of(request));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.reject(id, "admin", "Self rejection"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(repository, never()).save(any());
        verify(auditService).recordIndependent(
                eq("admin"), eq(request.getAgentId()), eq(request.getToolId()),
                eq("SELF_REJECTION_BLOCKED"),
                eq(request.getPolicyRuleId().toString()), anyString());
    }

    @Test
    void approvalCreationMustRequireRequesterIdentity() {
        assertThrows(
                ResponseStatusException.class,
                () -> service.create(
                        UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        null, Map.of("amount", 100)));

        verify(repository, never()).save(any());
    }
}
