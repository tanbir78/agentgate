CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE RESTRICT,
    policy_rule_id UUID NOT NULL REFERENCES policy_rules(id) ON DELETE RESTRICT,

    end_user_id VARCHAR(255),

    arguments JSONB NOT NULL DEFAULT '{}'::jsonb,
    arguments_sha256 VARCHAR(64) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),

    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,

    decided_at TIMESTAMPTZ,
    decided_by VARCHAR(120),
    decision_reason VARCHAR(1000),

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT chk_approval_expiry CHECK (expires_at > requested_at),

    CONSTRAINT chk_approval_decision CHECK (
        (status = 'PENDING' AND decided_at IS NULL AND decided_by IS NULL)
        OR
        (status <> 'PENDING' AND decided_at IS NOT NULL AND decided_by IS NOT NULL)
    )
);

CREATE INDEX idx_approval_requests_status_expiry
    ON approval_requests(status, expires_at);

CREATE INDEX idx_approval_requests_agent
    ON approval_requests(agent_id, requested_at DESC);

CREATE INDEX idx_approval_requests_tool
    ON approval_requests(tool_id);

CREATE INDEX idx_approval_requests_pending
    ON approval_requests(requested_at DESC)
    WHERE status = 'PENDING';