# Sequence diagrams — current Stage 4/5 implementation

## Agent client-credentials token issuance

```mermaid
sequenceDiagram
  participant Agent
  participant AS as Spring Authorization Server
  participant Repo as AgentRegisteredClientRepository
  participant DB as PostgreSQL
  participant Customizer as AgentTokenCustomizer
  Agent->>AS: POST /oauth2/token (client_secret_basic, client_credentials)
  AS->>Repo: findByClientId(clientId)
  Repo->>DB: Load active agent and BCrypt hash
  DB-->>Repo: Agent record
  Repo-->>AS: RegisteredClient
  AS->>Customizer: Customize JWT claims
  Customizer->>DB: Recheck agent active + clearance
  DB-->>Customizer: Agent metadata
  Customizer-->>AS: agent_id, clearance claims
  AS-->>Agent: RS256 access token + tools:invoke scope
```

## Agent MCP invocation (current fail-closed behavior)

```mermaid
sequenceDiagram
  participant Agent
  participant Security as Resource Server
  participant MCP as MCP Facade
  participant Exec as ToolExecutionService
  participant Identity as AgentService
  participant Policy as PolicyDecisionProvider
  Agent->>Security: MCP call with Bearer JWT
  Security->>Security: Validate signature, issuer, expiry, scope
  Security->>MCP: Authenticated request
  MCP->>Exec: invoke(agentClientId, toolName, arguments, delegation)
  Exec->>Identity: Recheck agent active
  Exec->>Exec: Verify optional HMAC delegation
  Exec->>Policy: Check discovery and policy decision
  Policy-->>Exec: DENY (bootstrap default)
  Exec-->>MCP: DENY + rule ID + explanation
  MCP-->>Agent: Tool call denied; no downstream request sent
```
