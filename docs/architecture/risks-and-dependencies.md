# Stage 1: Ambiguities, Risks, Dependencies, Trade-offs

## Ambiguities to resolve (need your answer or an assumption)
| # | Ambiguity | Working assumption | Decide by |
|---|-----------|--------------------|-----------|
| A1 | QA/C thresholds | Exact QA1–QA5 and C1–C12 wording is available in the course specification; preserve the stated thresholds verbatim | Resolved |
| A2 | Who issues JWTs: the gateway itself or an external IdP? | AgentGate embeds Spring Authorization Server for agent clients; admin bootstrap uses local HTTP Basic for this course build (ADR-003) | Resolved |
| A3 | "Clearance" of an agent: where does it live? | Stored on agent record, copied into JWT claim only by the server; never read from agent-supplied args | Resolved in Stage 4 |
| A4 | Delegation model (agent acting for user) | A trusted upstream broker signs `agentClientId:endUserId` using HMAC-SHA256; AgentGate verifies the signature. Policy authorization of that delegated identity is pending FR3 | Partially resolved |
| A5 | How agents call tools: MCP only, or REST too? | Gateway exposes one Spring AI MCP Streamable HTTP endpoint; downstream adapters support REST and MCP. Fine-grained discovery remains policy-dependent | Partially resolved in Stage 5 |
| A6 | APPROVAL_REQUIRED call semantics: block or async? | Return MCP result "pending approval" with approvalId; approved call executes server-side; agent can poll | Stage 9 gate |
| A7 | Fail-safe per risk level when infra is down | LOW: last-known policy for at most five minutes; MEDIUM/HIGH: fail closed immediately; LOW also fails closed after five minutes (ADR-004) | Stage 7 gate |
| A8 | Spring Boot 4.x + Spring AI MCP compatibility | Selected Boot 4.1.2 + Spring AI 2.0.2 + springdoc 3.2.0 from official compatibility documentation; Maven resolution/build still pending | Partially resolved |

## Technical risks
| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Boot 4.x / Spring AI / springdoc / Testcontainers version mismatch (Boot 4 modularised starters and moved packages) | Med | High | Pin via Boot/Spring AI BOMs, use springdoc 3.2.x for Boot 4.1.x, run `scripts/verify-deps.sh` |
| R2 | MCP support is young; server-side proxying of tools/call with per-request auth | Med | High | Isolate behind `ToolTransport` adapter; MCP-over-HTTP (streamable) first |
| R3 | QA2 (p95 <= 30 ms overhead) with audit hash chain serialising writes | Med | High | Per-chain advisory lock, hash computed in-process, measure overhead separately from downstream latency |
| R4 | Audit chain "tamper-proof" overclaim | Med | Med | Document limits; periodic signed checkpoint exported outside DB (ADR-005) |
| R5 | Concurrent approval decisions / duplicate execution | Med | High | Optimistic locking (@Version) + unique idempotency key + state machine |
| R6 | Policy refresh <= 10 s across restarts/instances | Low | Med | Version counter polled every 2 s + Redis pub/sub invalidation |
| R7 | Redis down breaks rate limiting | Med | Med | Fail-closed for writes/HIGH, bounded local fallback for LOW reads |
| R8 | 8 GB laptop with 4 containers + JVM | Med | Med | JVM -Xmx512m, Postgres/Redis tuned small, no Kafka/Keycloak |
| R9 | Scope is huge for one student | High | High | Vertical slices; walking skeleton first; defend what is built honestly |
| R10 | Sandbox has no Maven, Docker or network | Certain (here) | High | Build verification happens on your machine via scripts I provide; I label results PENDING until you paste logs |

## Dependency order
identity -> registry -> gateway(core pipeline) -> policy -> guard -> limiter -> audit -> approval -> admin(kill switch) -> health -> frontend. `common` has no outbound dependency.

## Key trade-offs
- Modular monolith vs microservices: one deployable fits 8 GB laptop and academic scope; boundaries enforced by tests (ADR-001).
- Embedded authorization server vs Keycloak: lighter, but we own more security code.
- Postgres hash chain vs external ledger: simple and queryable; needs external checkpoints for stronger integrity.
- Redis Lua counters vs Bucket4j: Lua is small, atomic, and testable with Testcontainers.
