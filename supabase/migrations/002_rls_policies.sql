-- Migration 002: Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;

-- Jobs: owner can read/write/delete their own jobs only
CREATE POLICY "jobs_select_own" ON jobs
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "jobs_insert_own" ON jobs
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "jobs_update_own" ON jobs
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "jobs_delete_own" ON jobs
  FOR DELETE USING (owner_id = auth.uid());

-- Candidates: recruiter owns via job.owner_id
CREATE POLICY "candidates_select_own" ON candidates
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE owner_id = auth.uid())
  );

CREATE POLICY "candidates_insert_own" ON candidates
  FOR INSERT WITH CHECK (
    job_id IN (SELECT id FROM jobs WHERE owner_id = auth.uid())
  );

CREATE POLICY "candidates_update_own" ON candidates
  FOR UPDATE USING (
    job_id IN (SELECT id FROM jobs WHERE owner_id = auth.uid())
  );

CREATE POLICY "candidates_delete_own" ON candidates
  FOR DELETE USING (
    job_id IN (SELECT id FROM jobs WHERE owner_id = auth.uid())
  );

-- Candidate analysis: recruiter owns via candidate → job
CREATE POLICY "analysis_select_own" ON candidate_analysis
  FOR SELECT USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON j.id = c.job_id
      WHERE j.owner_id = auth.uid()
    )
  );

CREATE POLICY "analysis_insert_own" ON candidate_analysis
  FOR INSERT WITH CHECK (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON j.id = c.job_id
      WHERE j.owner_id = auth.uid()
    )
  );

-- Candidate scores: recruiter owns via candidate → job
CREATE POLICY "scores_select_own" ON candidate_scores
  FOR SELECT USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON j.id = c.job_id
      WHERE j.owner_id = auth.uid()
    )
  );

CREATE POLICY "scores_insert_own" ON candidate_scores
  FOR INSERT WITH CHECK (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON j.id = c.job_id
      WHERE j.owner_id = auth.uid()
    )
  );

CREATE POLICY "scores_update_own" ON candidate_scores
  FOR UPDATE USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN jobs j ON j.id = c.job_id
      WHERE j.owner_id = auth.uid()
    )
  );
