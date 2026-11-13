# Requirement Traceability Matrix (RTM)

Status vocabulary: COMPLETED / PARTIALLY COMPLETED / NOT COMPLETED.
Nothing is COMPLETED without evidence. Current state: scaffold only, so all implementation items are NOT COMPLETED.

## Functional requirements

| ID | Requirement | Module(s) | Key classes (planned) | Persistence | Test (planned) | Stage | Status |
|----|-------------|-----------|----------------------|-------------|----------------|-------|--------|
| FR1 | Tool registry: CRUD, search, pagination, REST + MCP servers, OpenAPI import, risk level, owner team, input schema, health, MCP discovery | registry, health | ToolService, OpenApiImporter, ToolServerAdapter (REST/MCP), McpDiscoveryServer | tool, tool_server, team | ToolRegistryIT, McpDiscoveryIT, OpenApiImportTest | 5 | NOT COMPLETED |
| FR2 | Agent identity: registration, (de)activation, OAuth2 client-credentials, hashed secrets, JWT validation, optional end-user, delegation validation | identity | AgentService, ClientSecretHasher, DelegationValidator, JwtAgentConverter | agent, agent_credential | AgentAuthIT, DelegationTest | 4 | NOT COMPLETED |
| FR3 | Policy engine: CRUD, versioning, activate/deactivate, conditions (agent/tool/arg/user), ALLOW/DENY/APPROVAL_REQUIRED, default deny, dry-run, refresh <= 10 s | policy | PolicyEvaluator, ConditionStrategy, PolicyAuthorizationManager, PolicySnapshotCache | policy, policy_version | PolicyEvaluatorTest, PolicyRefreshIT | 7 | NOT COMPLETED |
| FR4 | Human approval: lifecycle, assignment, approve/reject/edit-and-approve, expiry auto-reject, web + webhook notification, history, duplicate/concurrent decision protection, kill-switch cancel | approval, notification | ApprovalStateMachine, ApprovalCommand, ApprovalExpiryJob, WebhookNotifier | approval, approval_history, notification | ApprovalLifecycleIT, ConcurrentDecisionIT | 9 | NOT COMPLETED |
| FR5 | Guard pipeline: input (schema, missing, invalid, constraints), output (email, BD phone, NID, clearance, size limit, truncation notice); new guard = new bean | guard | Guard, InputGuard, OutputGuard, GuardChain, *Redactor | none | GuardChainTest, NewGuardExtensibilityTest | 8 | NOT COMPLETED |
| FR6 | Rate limits and quotas: per agent/tool, daily, write limits, blast radius, Redis counters, violation events, alerts, reset | limiter | RateLimiter (Redis Lua), QuotaService, LimitViolationEvent | rate_limit_configuration, quota_usage | RateLimiterIT (Testcontainers Redis, concurrent) | 10 | NOT COMPLETED |
| FR7 | Audit: full record, hash chain, verify command, search/filter/paginate, CSV/JSON export, tamper tests, concurrency-safe, honest limits + external anchor | audit | AuditWriter, HashChain, AuditVerifier, CheckpointAnchor | audit_record | HashChainTest, TamperDetectionIT, ConcurrentAuditIT | 11 | NOT COMPLETED |
| FR8 | Kill switch: agent / tool / all-writes, re-enable, immediate effect, cancel pending approvals, audit, admin-only | admin | KillSwitchService, KillSwitchGuard | kill_switch | KillSwitchIT | 12 | NOT COMPLETED |
| FR9 | Policy playground: agent/tool/args, current-or-draft, decision + rule + failed conditions + dry-run, never executes tools | policy, admin | PlaygroundService (depends on evaluator only, never on the executor) | none | PlaygroundNoExecutionArchTest | 13 | NOT COMPLETED |
| FR10 | Downstream health: per-tool checks, timeouts, circuit breaker, recovery, dashboard, hide unhealthy tools from discovery | health, gateway | HealthProbeScheduler, Resilience4j CircuitBreaker, DiscoveryFilter | tool (health columns) | CircuitBreakerIT | 14 | NOT COMPLETED |

## Quality attributes

| ID | Scenario (as summarised in the master prompt) | Mechanism | Test / script | Stage | Status |
|----|------|-----------|---------------|-------|--------|
| QA1 | 30 malicious + 200 legitimate calls: no malicious call reaches downstream, legitimate calls served | Default deny, policy, guards; downstream call counter in test double | tests/security, run-security-tests.sh | 17 | NOT COMPLETED |
| QA2 | 100 RPS, gateway-added p95 overhead <= 30 ms | Policy snapshot cache, Redis Lua limiter, minimal hops, batched audit hashing | tests/performance (k6), run-performance-tests.sh | 17 | NOT COMPLETED |
| QA3 | Audit investigation < 1 min; tampering detected | Indexed search, hash chain, verify script | tests/audit, verify-audit.sh | 11/17 | NOT COMPLETED |
| QA4 | Policy store failure -> last-known policy behaviour | Last-known-good snapshot, risk-based fail-safe | tests/availability | 7/17 | NOT COMPLETED |
| QA5 | New REST tool onboarded < 10 min, no code change | OpenAPI import + generic REST adapter | tests/adoption, run-adoption-test.sh | 5/17 | NOT COMPLETED |

NOTE: I only have the QA/C wording as summarised in the master prompt. Please paste the exact wording from the course spec so thresholds are never reinterpreted.

## Common requirements

| ID | Requirement | Where | Evidence (planned) | Stage | Status |
|----|-------------|-------|--------------------|-------|--------|
| C1 | Java 21/25, Boot 4.x, Maven, Compose, one-command start | pom.xml, docker-compose.yml | `docker compose up --build` log | 3/19 | NOT COMPLETED |
| C2 | Profiles, env vars, typed config + validation, no committed secrets | @ConfigurationProperties, .env.example, .gitignore | startup-fails-without-secret test | 3 | NOT COMPLETED |
| C3 | springdoc, Security, Bean Validation, RFC 9457, pagination | all presentation layers | OpenAPI JSON, ProblemDetail tests | 4-13 | NOT COMPLETED |
| C4 | Actuator, readiness, Micrometer, tracing, JSON logs, trace-ID propagation | common | /actuator output, log sample | 3 | NOT COMPLETED |
| C5 | JUnit 5, slice tests, Testcontainers, k6, CI | backend/src/test, .github/workflows | CI run | 17 | NOT COMPLETED |
| C6 | ArchUnit / Modulith architecture verification | ArchitectureTest | passing test | 3 | NOT COMPLETED (test written, not yet run) |
| C7 | C4 diagrams, >= 4 ADRs, utility tree >= 6 scenarios, mini-ATAM | docs/architecture, docs/adr | files | 1-2 | PARTIALLY COMPLETED (drafted, awaiting your review) |
| C8 | Pattern justification table | docs/design-patterns | doc | 18 | NOT COMPLETED |
| C9 | Evidence report: raw results, charts, failures, fixes | docs/testing | generated from real runs | 18 | NOT COMPLETED |
| C10 | Instructor change request | extensible modules | pending instructor | 19+ | NOT COMPLETED |
| C11 | Incremental Git history, honest AI log | .git, docs/process/ai-usage-log.md | git log | all | PARTIALLY COMPLETED (log started) |
| C12 | 15-minute defence | docs/defence | Q&A doc | 20 | NOT COMPLETED |
