CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key VARCHAR(120) NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMPTZ,
    UNIQUE (policy_key, version)
);

CREATE UNIQUE INDEX idx_policies_single_active
    ON policies (policy_key)
    WHERE status = 'ACTIVE';

CREATE TABLE policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES agents(id) ON DELETE RESTRICT,
    tool_id UUID REFERENCES tools(id) ON DELETE RESTRICT,
    effect VARCHAR(30) NOT NULL
        CHECK (effect IN ('ALLOW', 'DENY', 'APPROVAL_REQUIRED')),
    priority INTEGER NOT NULL DEFAULT 100,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policy_rules_policy_enabled
    ON policy_rules(policy_id, enabled);

CREATE INDEX idx_policy_rules_agent_tool
    ON policy_rules(agent_id, tool_id);



