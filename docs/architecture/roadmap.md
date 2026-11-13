# Development Roadmap (vertical slices)

Walking skeleton first: one agent -> one REST tool -> allow/deny -> audit row. Then widen.

| Stage | Deliverable | Exit check (run on your machine until sandbox has Maven) |
|------:|-------------|-------------|
| 1 | RTM, risks, C4, structure, roadmap | Reviewed by you |
| 2 | ADRs (>=4), utility tree, mini-ATAM | Reviewed by you |
| 3 | pom, config, Compose, Flyway V1 baseline, ArchUnit test, CI | `./mvnw verify`, `docker compose up --build` healthy |
| 4 | Identity, OAuth2, delegation | AgentAuthIT green |
| 5 | Registry, REST + MCP adapters, OpenAPI import | McpDiscoveryIT green |
| 6 | Gateway pipeline skeleton end-to-end | Walking-skeleton IT |
| 7 | Policy engine + snapshot cache | PolicyEvaluatorTest, refresh <= 10 s |
| 8 | Guards | GuardChainTest |
| 9 | Approvals | ConcurrentDecisionIT |
| 10 | Limits/quotas | RateLimiterIT |
| 11 | Audit chain + verifier | TamperDetectionIT |
| 12 | Kill switch | KillSwitchIT |
| 13 | Playground | PlaygroundNoExecutionArchTest |
| 14 | Resilience/health | CircuitBreakerIT |
| 15 | Frontend, 20 pages | Playwright/manual checklist against live API |
| 16-17 | Hardening, QA1-QA5 runs | Real reports in docs/testing |
| 18-20 | Docs, Compose validation, defence | Completion matrix |

Decision gates where I stop for your approval: ADR-003 (identity), delegation model (A4), approval semantics (A6), fail-safe policy (A7).
