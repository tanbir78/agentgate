# ADR-002: Ordered Chain of Responsibility for the gateway pipeline
- Status: Proposed
- Context: Each call needs auth, kill switch, tool check, input guard, policy, limits, execution, output guard, audit, in fixed order, and new guards must be addable without editing the pipeline (FR5).
- Decision: `GatewayStage` beans with `@Order`, executed by `GatewayPipeline`; a stage can short-circuit with a final decision. Guards are `Guard` beans auto-collected via `List<Guard>`.
- Alternatives rejected: one big service method (untestable, violates open/closed); Spring Security filter chain only (HTTP-level, cannot see parsed MCP tool name/arguments cleanly).
- Consequences: (+) extensible, each stage unit-testable, order explicit; (-) ordering bugs possible, so an ordering test asserts the stage sequence and that "execute" is last before output guards.
