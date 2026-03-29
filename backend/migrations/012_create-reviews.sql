CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL,
  comment      TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_user_id      ON reviews(user_id);
CREATE INDEX idx_reviews_is_published ON reviews(is_published);
