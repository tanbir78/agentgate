package com.agentgate.approval.presentation;

import com.agentgate.approval.application.ApprovalService;
import com.agentgate.approval.application.ApprovalDtos.ApprovalResponse;
import com.agentgate.approval.domain.ApprovalStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApprovalControllerTest {

    private ApprovalService service;
    private ApprovalController controller;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        service = mock(ApprovalService.class);
        controller = new ApprovalController(service);
        authentication = new UsernamePasswordAuthenticationToken(
                "admin", "not-used");
    }

    private ApprovalResponse response(ApprovalStatus status) {
        return new ApprovalResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                "test-user",
                "a".repeat(64),
                status,
                Instant.now().minusSeconds(120),
                Instant.now().minusSeconds(60),
                Instant.now(),
                status == ApprovalStatus.EXPIRED ? "SYSTEM" : "admin",
                null,
                1L
        );
    }

    @Test
    void expiredApprovalShouldReturnConflict() {
        UUID id = UUID.randomUUID();

        when(service.approve(id, "admin", "test"))
                .thenReturn(response(ApprovalStatus.EXPIRED));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.approve(
                        id,
                        new com.agentgate.approval.application.ApprovalDtos.DecisionRequest("test"),
                        authentication
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void expiredRejectionShouldReturnConflict() {
        UUID id = UUID.randomUUID();

        when(service.reject(id, "admin", "test"))
                .thenReturn(response(ApprovalStatus.EXPIRED));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.reject(
                        id,
                        new com.agentgate.approval.application.ApprovalDtos.DecisionRequest("test"),
                        authentication
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void approvedRequestShouldReturnSuccessfully() {
        UUID id = UUID.randomUUID();
        ApprovalResponse expected = response(ApprovalStatus.APPROVED);

        when(service.approve(id, "admin", "test"))
                .thenReturn(expected);

        ApprovalResponse actual = controller.approve(
                id,
                new com.agentgate.approval.application.ApprovalDtos.DecisionRequest("test"),
                authentication
        );

        assertEquals(ApprovalStatus.APPROVED, actual.status());
    }

    @Test
    void rejectedRequestShouldReturnSuccessfully() {
        UUID id = UUID.randomUUID();
        ApprovalResponse expected = response(ApprovalStatus.REJECTED);

        when(service.reject(id, "admin", "test"))
                .thenReturn(expected);

        ApprovalResponse actual = controller.reject(
                id,
                new com.agentgate.approval.application.ApprovalDtos.DecisionRequest("test"),
                authentication
        );

        assertEquals(ApprovalStatus.REJECTED, actual.status());
    }
}