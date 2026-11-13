CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    client_id VARCHAR(100) NOT NULL UNIQUE,
    client_secret_hash VARCHAR(100) NOT NULL,
    clearance VARCHAR(20) NOT NULL CHECK (clearance IN ('LOW', 'MEDIUM', 'HIGH')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_agents_active ON agents(active);

CREATE TABLE tool_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL UNIQUE,
    transport_type VARCHAR(20) NOT NULL CHECK (transport_type IN ('REST', 'MCP')),
    base_url VARCHAR(2048) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(1000) NOT NULL,
    transport_type VARCHAR(20) NOT NULL CHECK (transport_type IN ('REST', 'MCP')),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    owner_team VARCHAR(120) NOT NULL,
    endpoint_url VARCHAR(2048) NOT NULL,
    http_method VARCHAR(10),
    input_schema JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    health_status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN' CHECK (health_status IN ('UNKNOWN', 'UP', 'DOWN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_tools_active_risk ON tools(active, risk_level);
CREATE INDEX idx_tools_owner_team ON tools(owner_team);
