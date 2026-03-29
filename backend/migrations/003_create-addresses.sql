CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        VARCHAR(50) NOT NULL DEFAULT 'Casa',
  street       VARCHAR(255) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  postcode     VARCHAR(10) NOT NULL,
  province     VARCHAR(100) NOT NULL DEFAULT 'Barcelona',
  country      VARCHAR(2) NOT NULL DEFAULT 'ES',
  instructions TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
