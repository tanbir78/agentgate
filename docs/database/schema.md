# Initial database schema

The first Flyway migration creates the identity and tool-registry tables. Later stages add policies, approvals, limits, audit records and kill-switch state.

```mermaid
erDiagram
  AGENTS {
    uuid id PK
    varchar name
    varchar client_id UK
    varchar client_secret_hash
    varchar clearance
    boolean active
    timestamptz created_at
    timestamptz updated_at
    bigint version
  }
  TOOL_SERVERS {
    uuid id PK
    varchar name UK
    varchar transport_type
    varchar base_url
    boolean active
    timestamptz created_at
  }
  TOOLS {
    uuid id PK
    varchar name UK
    varchar description
    varchar transport_type
    varchar risk_level
    varchar owner_team
    varchar endpoint_url
    varchar http_method
    jsonb input_schema
    boolean active
    varchar health_status
    timestamptz created_at
    timestamptz updated_at
    bigint version
  }
```

`tool_servers` and `tools` are not yet joined by a foreign key. A tool currently stores the downstream endpoint directly; explicit server-to-tool association and connection credentials remain a later registry enhancement.
