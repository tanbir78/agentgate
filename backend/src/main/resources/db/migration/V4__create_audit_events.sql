CREATE TABLE audit_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 actor_id VARCHAR(255),
 agent_id UUID REFERENCES agents(id) ON DELETE RESTRICT,
 tool_id UUID REFERENCES tools(id) ON DELETE RESTRICT,
 decision VARCHAR(40) NOT NULL,
 rule_id VARCHAR(100),
 explanation VARCHAR(1000)
);
CREATE INDEX idx_audit_events_occurred_at ON audit_events(occurred_at DESC);
CREATE INDEX idx_audit_events_agent ON audit_events(agent_id, occurred_at DESC);
CREATE INDEX idx_audit_events_tool ON audit_events(tool_id, occurred_at DESC);
CREATE OR REPLACE FUNCTION prevent_audit_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_events is append-only'; END;
$$;
CREATE TRIGGER trg_audit_events_no_update_delete BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_event_mutation();