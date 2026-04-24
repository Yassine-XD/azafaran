-- Refresh-token family tracking for reuse-attack detection.
--
-- When a client refreshes, we rotate (delete) the old row and issue a new one.
-- If an already-rotated token is presented again, that's a classic replay
-- attack (token was stolen before rotation, or the legitimate client kept a
-- copy). Previously we could not tell the difference between "expired" and
-- "reused" because the row was gone.
--
-- This migration keeps used rows around (marked `revoked_at`) and links each
-- rotation to its parent so we can walk the chain and nuke every descendant
-- on reuse detection. All tokens in the same `family_id` belong to one login
-- session; revoking the family forces the user to re-authenticate.

ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS family_id   UUID,
  ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_at  TIMESTAMPTZ;

-- Backfill: every existing row is its own family.
UPDATE refresh_tokens SET family_id = id WHERE family_id IS NULL;

ALTER TABLE refresh_tokens
  ALTER COLUMN family_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id  ON refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at ON refresh_tokens(revoked_at);
