# ADR-006: Explicit State pattern + optimistic locking for approvals
- Status: Proposed
- Decision: States PENDING -> APPROVED | REJECTED | EXPIRED | CANCELLED, then EXECUTING -> EXECUTED | FAILED. Transitions only via `ApprovalStateMachine`; JPA `@Version` plus conditional UPDATE (`WHERE status='PENDING'`) guarantees exactly one winning decision; execution guarded by a unique idempotency key.
- Rejected: boolean flags (illegal combinations), app-level locks (not safe across instances).
- Consequences: clear history rows per transition; duplicate decisions return 409.
