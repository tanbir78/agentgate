# C4 component diagrams — current Stage 4/5 implementation

## Identity module

```mermaid
flowchart LR
  Admin[Administrator] --> AgentController
  AgentController --> AgentService
  AgentService --> AgentStore[AgentStore port]
  AgentStore --> AgentStoreAdapter
  AgentStoreAdapter --> AgentRepository[Spring Data AgentRepository]
  AgentRepository --> DB[(PostgreSQL)]
  AgentRepository --> RegisteredClientRepo[AgentRegisteredClientRepository]
  RegisteredClientRepo --> AS[Spring Authorization Server]
  AS --> TokenCustomizer[AgentTokenCustomizer]
  TokenCustomizer --> AgentStore
  AS --> JWT[RS256 JWT]
```

## Registry and gateway modules

```mermaid
flowchart TD
  Admin[Administrator] --> ToolController
  Admin --> ToolServerController
  ToolController --> ToolService
  ToolController --> OpenApiImporter
  ToolServerController --> ToolServerService
  ToolService --> ToolStore[ToolStore port]
  ToolServerService --> ToolServerStore[ToolServerStore port]
  ToolStore --> ToolStoreAdapter --> ToolRepository --> DB[(PostgreSQL)]
  ToolServerStore --> ToolServerStoreAdapter --> ToolServerRepository --> DB
  Agent[Authenticated MCP Agent] --> MCP[Spring AI MCP Streamable HTTP]
  MCP --> McpFacade[AgentGateMcpTools]
  McpFacade --> Execution[ToolExecutionService]
  Execution --> Identity[AgentService + DelegationIdentityResolver]
  Execution --> Policy[PolicyDecisionProvider]
  Policy --> DefaultDeny[DefaultDenyPolicyDecisionProvider]
  Execution --> ExecutorPort[ToolExecutor]
  ExecutorPort --> RestAdapter[RestToolAdapter]
  ExecutorPort --> McpAdapter[McpToolAdapter]
  RestAdapter --> REST[Downstream REST]
  McpAdapter --> MCPDownstream[Downstream MCP]
```

The default policy implementation returns DENY and hides every tool from agent discovery. This ensures the transport adapters cannot be reached until FR3 is implemented.
