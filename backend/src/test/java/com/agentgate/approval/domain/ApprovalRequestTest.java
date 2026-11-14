package com.agentgate.approval.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ApprovalRequestTest {

    private ApprovalRequest createRequest(Instant expiry) {
        return new ApprovalRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                "test-user",
                Map.of("amount", 100),
                "a".repeat(64),
                expiry
        );
    }

    @Test
    void pendingRequestShouldBeApproved() {
        ApprovalRequest request =
                createRequest(Instant.now().plusSeconds(300));

        request.approve("admin", "Approved for testing");

        assertEquals(ApprovalStatus.APPROVED, request.getStatus());
        assertEquals("admin", request.getDecidedBy());
        assertEquals("Approved for testing", request.getDecisionReason());
        assertNotNull(request.getDecidedAt());
    }

    @Test
    void pendingRequestShouldBeRejected() {
        ApprovalRequest request =
                createRequest(Instant.now().plusSeconds(300));

        request.reject("admin", "Rejected for testing");

        assertEquals(ApprovalStatus.REJECTED, request.getStatus());
        assertEquals("admin", request.getDecidedBy());
        assertEquals("Rejected for testing", request.getDecisionReason());
        assertNotNull(request.getDecidedAt());
    }

    @Test
    void expiredRequestShouldBecomeExpiredWhenApproved() {
        ApprovalRequest request =
                createRequest(Instant.now().minusSeconds(60));

        request.approve("admin", "Late approval");

        assertEquals(ApprovalStatus.EXPIRED, request.getStatus());
        assertEquals("SYSTEM", request.getDecidedBy());
        assertNotNull(request.getDecidedAt());
    }

    @Test
    void alreadyApprovedRequestShouldNotBeDecidedAgain() {
        ApprovalRequest request =
                createRequest(Instant.now().plusSeconds(300));

        request.approve("admin", "Approved");

        assertThrows(
                IllegalStateException.class,
                () -> request.reject("admin", "Second decision")
        );
    }

    @Test
    void expiredRequestShouldNotBeExpiredTwice() {
        ApprovalRequest request =
                createRequest(Instant.now().minusSeconds(60));

        request.expire();

        assertThrows(
                IllegalStateException.class,
                request::expire
        );
    }
}