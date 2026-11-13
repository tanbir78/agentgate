# C4 Architecture Diagrams (Mermaid, render on GitHub)

## Level 1: System Context
```mermaid
C4Context
  title AgentGate - System Context
  Person(admin, "Administrator", "Manages tools, policies, kill switch, audit")
  Person(approver, "Approver", "Decides pending approvals")
  System_Ext(agent, "AI Agent", "Calls tools via MCP using OAuth2 client credentials")
  System(gate, "AgentGate", "Governance gateway for every agent tool call")
  System_Ext(rest, "Downstream REST tools", "HTTP APIs")
  System_Ext(mcp, "Downstream MCP servers", "MCP tools")
  System_Ext(hook, "Webhook receiver", "Approval notifications")
  Rel(agent, gate, "tools/list, tools/call", "MCP over HTTPS + JWT")
  Rel(admin, gate, "Administers", "Web UI / REST")
  Rel(approver, gate, "Approves / rejects", "Web UI")
  Rel(gate, rest, "Forwards allowed calls", "HTTP")
  Rel(gate, mcp, "Forwards allowed calls", "MCP client")
  Rel(gate, hook, "Notifies", "Signed HTTP POST")
```

## Level 2: Containers
```mermaid
C4Container
  title AgentGate - Containers
  Person(admin, "Admin / Approver")
  System_Ext(agent, "AI Agent")
  System_Boundary(b, "AgentGate") {
    Container(spa, "Admin Dashboard", "React, TypeScript, Vite", "Admin UI")
    Container(api, "AgentGate Backend", "Java 21, Spring Boot 4 modular monolith", "MCP server, Admin REST API, auth server")
    ContainerDb(pg, "PostgreSQL", "Relational DB", "Config, approvals, audit chain")
    ContainerDb(redis, "Redis", "Counters", "Rate limits, quotas, policy invalidation")
  }
  System_Ext(down, "Downstream tools", "REST / MCP")
  Rel(admin, spa, "Uses", "HTTPS")
  Rel(spa, api, "Calls", "REST + JWT")
  Rel(agent, api, "MCP + JWT")
  Rel(api, pg, "JPA / Flyway")
  Rel(api, redis, "Lua scripts")
  Rel(api, down, "HTTP / MCP client, Resilience4j")
```

## Level 3: Components (backend modules)
```mermaid
flowchart LR
  subgraph presentation
    MCP[MCP endpoint]:::p
    ADM[Admin REST controllers]:::p
  end
  MCP --> GW[gateway: pipeline + executor]
  ADM --> ID[identity]
  ADM --> REG[registry]
  ADM --> POL[policy]
  ADM --> APR[approval]
  ADM --> AUD[audit]
  ADM --> ADMIN[admin: kill switch, settings]
  GW --> ID
  GW --> ADMIN
  GW --> POL
  GW --> GRD[guard]
  GW --> LIM[limiter]
  GW --> APR
  GW --> REG
  GW --> HLT[health]
  GW -. events .-> AUD
  APR -. events .-> NOT[notification]
  LIM -. events .-> NOT
  ADMIN -. events .-> APR
  HLT --> REG
  ID --> COM[common]
  REG --> COM
  POL --> COM
  classDef p fill:#e8f0fe,stroke:#4a6fa5;
```
Rule: arrows only point downward/rightward as above; `common` depends on nothing; cross-module calls go through an interface in the callee's `application` package; reverse notifications use Spring events (Observer).

## Level 3b: Gateway pipeline (Chain of Responsibility)
```mermaid
sequenceDiagram
  participant A as Agent
  participant G as MCP endpoint
  participant P as Pipeline
  participant D as Downstream
  A->>G: tools/call (JWT, tool, args, user)
  G->>P: GatewayRequest(traceId)
  P->>P: 1 Authenticate + delegation check
  P->>P: 2 Kill switch
  P->>P: 3 Tool exists + healthy
  P->>P: 4 Input guards
  P->>P: 5 Policy decision (default deny)
  alt DENY
    P-->>A: denied (audited)
  else APPROVAL_REQUIRED
    P-->>A: pending(approvalId) (audited), nothing executed
  else ALLOW
    P->>P: 6 Rate limit / quota
    P->>D: 7 Execute (circuit breaker, timeouts)
    D-->>P: result
    P->>P: 8 Output guards (redaction, size)
    P-->>A: result
  end
  P->>P: 9 Audit append (hash chain) in every branch
```

## Level 4 (code): see docs/design-patterns (Stage 18) and the ER diagram in docs/database.
