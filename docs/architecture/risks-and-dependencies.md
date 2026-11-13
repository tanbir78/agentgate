# Stage 1: Ambiguities, Risks, Dependencies, Trade-offs

## Ambiguities to resolve (need your answer or an assumption)
| # | Ambiguity | Working assumption | Decide by |
|---|-----------|--------------------|-----------|
| A1 | Exact QA/C wording not in the prompt | Use prompt's summary; you supply original text | Now |
| A2 | Who issues JWTs: the gateway itself or an external IdP? | Gateway embeds Spring Authorization Server (local, free) for agents; admins log in via the same server (ADR-003) | Stage 4 gate |
| A3 | "Clearance" of an agent: where does it live? | Stored on agent record, copied into JWT claim only by the server; never read from agent-supplied args | Stage 4 |
| A4 | Delegation model (agent acting for user) | Agent sends a signed end-user token / user id; gateway verifies the agent is permitted to delegate for that user (RFC 8693-style `act` semantic, simplified) | Stage 4 gate |
| A5 | How agents call tools: MCP only, or REST too? | Gateway exposes ONE MCP server endpoint (tools/list, tools/call) to agents; downstream tools are REST or MCP | Stage 5 |
| A6 | APPROVAL_REQUIRED call semantics: block or async? | Return MCP result "pending approval" with approvalId; approved call executes server-side; agent can poll | Stage 9 gate |
| A7 | Fail-safe per risk level when infra is down | LOW: read ok from last-known policy; MEDIUM: last-known policy, writes denied; HIGH: deny (ADR-004) | Stage 7 gate |
| A8 | Spring Boot 4.x + Spring AI MCP compatibility | Must be verified from official docs/BOM when network is available | Stage 3 |

## Technical risks
| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Boot 4.x / Spring AI / Modulith / springdoc / Testcontainers version mismatch (Boot 4 modularised starters and moved packages) | High | High | Pin via BOMs, run `scripts/verify-deps.sh` first; fall back to latest compatible Boot 4.0.x |
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
