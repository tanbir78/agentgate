# ADR-004: Risk-based fail-safe when infrastructure fails (DECISION GATE)
- Status: Proposed
- Context: QA4 requires last-known-policy behaviour; spec forbids silently bypassing governance.
- Decision: Policy decisions are served from an in-memory last-known-good snapshot (refreshed by version polling + Redis invalidation). If the snapshot is unavailable or stale beyond a limit: LOW read -> allowed per snapshot; MEDIUM read -> snapshot, writes denied; HIGH -> denied. Redis down: writes/HIGH denied, LOW reads use bounded local counters. Audit write failure: HIGH/writes aborted (fail-closed); LOW reads fail-closed too unless config `audit.failure-mode=degraded`, which spools to local disk and raises an alert.
- Alternatives rejected: always fail-open (breaks security), always fail-closed (kills availability for harmless reads).
- Consequences: behaviour is explicit, testable, and tunable; more configuration to explain in the defence.
