-- In-app surveys for collecting user data.
-- Surveys are created from the admin dashboard and pushed via the existing
-- notification system (payload `type: "survey"`). Tapping the push opens an
-- in-app screen where the user submits answers. One response per user is
-- enforced via the UNIQUE (survey_id, user_id) constraint.

CREATE TABLE surveys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  questions     JSONB NOT NULL,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE survey_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (survey_id, user_id)
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX idx_surveys_published ON surveys(is_published) WHERE is_published = TRUE;

CREATE TRIGGER trg_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
