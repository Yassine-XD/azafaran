CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50) NOT NULL,
  entity_id   UUID,
  before      JSONB,
  after       JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin_id   ON audit_log(admin_id);
CREATE INDEX idx_audit_log_entity     ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
