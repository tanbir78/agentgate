# ADR-004: Risk-based fail-safe when the policy store is unavailable

- Status: Proposed (implementation pending FR3)
- Context: QA4 states that if the policy store is unreachable, MEDIUM- and HIGH-risk tools must fail closed, while LOW-risk tools continue using last-known policies for up to five minutes.
- Decision: Maintain a last-known-good, versioned policy snapshot. When the policy store is unavailable:
  - LOW-risk tool calls may use the last-known-good policy snapshot for no more than five minutes from its last successful refresh.
  - MEDIUM- and HIGH-risk tool calls fail closed immediately.
  - After the five-minute LOW-risk grace period, LOW-risk calls also fail closed.
  - No stale snapshot may override a kill switch or a locally known agent/tool deactivation.
- Alternatives rejected: Always fail-open (violates security); always fail-closed (fails QA4's LOW-risk continuity requirement); allowing MEDIUM-risk cached decisions (contradicts the explicit success measure).
- Consequences: (+) exact QA4 behavior and bounded stale-policy use; (-) the cache must track last successful refresh time, version, and tool risk, and the tests must simulate clock progression and policy-store outages.
- Evidence required: Runnable integration test proving LOW works at 4:59, LOW fails at/after 5:00, and MEDIUM/HIGH fail immediately. This evidence is pending until FR3 is implemented.
