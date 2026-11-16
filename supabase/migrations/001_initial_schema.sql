-- Migration 001: Initial schema
-- Run via: supabase db push OR paste into Supabase dashboard SQL editor

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description            TEXT,
  criteria               JSONB NOT NULL DEFAULT '{}',
  weights                JSONB NOT NULL DEFAULT '{"skills":25,"experience":25,"projects":25,"education":25}',
  mandatory_requirements TEXT[] NOT NULL DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_owner_id_idx ON jobs(owner_id);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  filename            TEXT NOT NULL,
  storage_path        TEXT NOT NULL,
  processing_status   TEXT NOT NULL DEFAULT 'Uploaded'
                        CHECK (processing_status IN ('Uploaded','Extracting','Checking','Scored','Failed','Needs_Review')),
  eligibility_status  TEXT
                        CHECK (eligibility_status IN ('Eligible','Not_Eligible','Needs_Review')),
  override_status     TEXT
                        CHECK (override_status IN ('Eligible','Not_Eligible','Needs_Review')),
  override_reason     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidates_job_id_idx ON candidates(job_id);

-- Candidate analysis (extracted profile)
CREATE TABLE IF NOT EXISTS candidate_analysis (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  schema_version    INTEGER NOT NULL DEFAULT 1,
  extracted_profile JSONB NOT NULL,
  evidence_snippets JSONB,
  warnings          JSONB,
  analyzed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidate_analysis_candidate_id_idx ON candidate_analysis(candidate_id);

-- Candidate scores
CREATE TABLE IF NOT EXISTS candidate_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  rule_version      INTEGER NOT NULL DEFAULT 1,
  component_scores  JSONB NOT NULL,
  preferred_matches JSONB,
  final_score       NUMERIC(5,2) NOT NULL,
  rank              INTEGER,
  explanation       JSONB,
  scored_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidate_scores_candidate_id_idx ON candidate_scores(candidate_id);

-- Auto-update updated_at on jobs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
