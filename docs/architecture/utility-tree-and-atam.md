# Utility Tree and Mini-ATAM

## Utility tree (importance, difficulty: H/M/L)
| # | Quality | Refined scenario | Imp | Diff | Tactic / decision |
|---|---------|------------------|-----|------|-------------------|
| 1 | Security | 30 malicious calls never reach any downstream tool | H | M | Default deny, input guards, kill switch (ADR-002) |
| 2 | Performance | At 100 RPS gateway-added p95 <= 30 ms | H | H | Snapshot cache, Lua limiter, lean pipeline |
| 3 | Integrity | Edited audit row detected by verify command in < 1 min | H | M | Hash chain + checkpoints (ADR-005) |
| 4 | Availability | Policy store outage -> last-known policy, HIGH risk denied | H | M | ADR-004 |
| 5 | Modifiability | New REST tool onboarded in < 10 min, no code change | M | M | OpenAPI import, generic REST adapter |
| 6 | Modifiability | New guard added by one new bean | M | L | Guard SPI, bean collection (FR5) |
| 7 | Consistency | Two approvers decide at once: exactly one wins | H | M | ADR-006 |
| 8 | Operability | Whole system on an 8 GB laptop with `docker compose up` | M | M | ADR-001, tuned JVM |
| 9 | Auditability | Any call traceable via trace ID across logs and audit | M | L | Micrometer tracing, MDC |

## Mini-ATAM
| Decision | Sensitivity point | Trade-off | Risk | Non-risk |
|----------|------------------|-----------|------|----------|
| Serialised audit chain (ADR-005) | Audit write time on QA2 | Integrity vs throughput | R3: lock contention at 100 RPS | Correctness under concurrency |
| In-process policy snapshot (ADR-004) | Refresh interval vs the 10 s activation bound | Freshness vs availability | Stale policy during outage (bounded, HIGH denied) | Latency |
| Embedded auth server (ADR-003) | Key handling | Simplicity vs owning security code | Key/secret mishandling | Resource use |
| Modular monolith (ADR-001) | Module coupling | Simplicity vs independent scaling | Boundary erosion | Deployability |
| Redis counters | Redis availability | Accuracy across instances vs dependency | Redis outage affects writes | Atomicity via Lua |
