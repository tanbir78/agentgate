# Design pattern justification — implemented subset

Only patterns with actual code are listed as implemented. The remaining course-expected patterns are not claimed as complete.

| Pattern | Requirement served | Participating classes | Why used | Alternative rejected |
|---|---|---|---|---|
| Adapter | FR1 | `RestToolAdapter`, `McpToolAdapter`, `ToolExecutor` | Presents one execution port for two different downstream protocols | Protocol-specific branches throughout the gateway |
| Strategy | FR1 | `ToolExecutor`, `RestToolAdapter`, `McpToolAdapter`, `ToolExecutionService` | Selects the adapter by registered `ToolTransport` at runtime | Large `if/else` transport switch in business logic |
| Proxy (governance proxy) | FR1–FR3 foundation | `AgentGateMcpTools`, `ToolExecutionService`, `PolicyDecisionProvider` | Agent calls cannot reach a downstream adapter without passing the gateway and policy boundary | Exposing downstream endpoints directly to agents |
| Repository / Registry | FR1, FR2 | `ToolRepository`, `ToolServerRepository`, `AgentRepository`, `AgentRegisteredClientRepository` | Centralizes persisted tool/server/agent lookup and registered OAuth client resolution | Direct JPA queries inside controllers |

## Patterns pending implementation

- Chain of Responsibility: ordered input/output guards and policy conditions (FR3, FR5).
- State: approval lifecycle (FR4).
- Command: immutable tool execution/approval commands (FR4, FR7).
- Observer: application events for audit and notifications (FR4, FR7).
- Decorator: result redaction, truncation and metrics around downstream execution (FR5).

These are intentionally marked pending until the corresponding classes and tests exist.
