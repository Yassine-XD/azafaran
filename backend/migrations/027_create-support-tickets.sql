CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_user', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE ticket_category AS ENUM ('order', 'payment', 'delivery', 'product', 'account', 'other');
CREATE TYPE ticket_sender AS ENUM ('user', 'admin');

CREATE SEQUENCE support_ticket_number_seq START 1;

CREATE OR REPLACE FUNCTION next_ticket_number() RETURNS TEXT AS $$
  SELECT 'TKT-' || LPAD(nextval('support_ticket_number_seq')::TEXT, 6, '0');
$$ LANGUAGE SQL;

CREATE TABLE support_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_number    VARCHAR(20) NOT NULL UNIQUE DEFAULT next_ticket_number(),
  subject          VARCHAR(200) NOT NULL,
  category         ticket_category NOT NULL DEFAULT 'other',
  status           ticket_status NOT NULL DEFAULT 'open',
  priority         ticket_priority NOT NULL DEFAULT 'normal',
  assigned_to      UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_for_admin BOOLEAN NOT NULL DEFAULT TRUE,
  unread_for_user  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type  ticket_sender NOT NULL,
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_ticket_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
  file_url     VARCHAR(500) NOT NULL,
  file_name    VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size_bytes   INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user        ON support_tickets(user_id);
CREATE INDEX idx_tickets_status      ON support_tickets(status);
CREATE INDEX idx_tickets_last_msg    ON support_tickets(last_message_at DESC);
CREATE INDEX idx_ticket_messages_tid ON support_ticket_messages(ticket_id, created_at);
CREATE INDEX idx_ticket_attach_mid   ON support_ticket_attachments(message_id);

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
