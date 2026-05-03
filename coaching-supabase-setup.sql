-- Coaching Pre-Screening Assessment Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- SCORING CONFIGURATION TABLE
-- Allows admin to edit scoring logic via UI
-- ============================================

CREATE TABLE IF NOT EXISTS cohort_scoring_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by text
);

-- Insert default scoring configuration
-- Questions: Q1-Q11 (scored), Q12 (free text - not in scoring), Q13 (hard gate)
INSERT INTO cohort_scoring_config (config_key, config_value) VALUES
  -- Point values for each question option (array index = option index)
  -- Q7 has bonus points on bottom option: [0,1,2,4]
  -- Q11 has special scoring: [0,0,1,3,3]
  ('question_scores', '{
    "q1": [0, 1, 2, 3],
    "q2": [0, 1, 2, 3],
    "q3": [0, 1, 2, 3],
    "q4": [0, 1, 2, 3],
    "q5": [0, 1, 2, 3],
    "q6": [0, 1, 2, 3],
    "q7": [0, 1, 2, 4],
    "q8": [0, 1, 2, 3],
    "q9": [0, 1, 2, 3],
    "q10": [0, 1, 2, 3],
    "q11": [0, 0, 1, 3, 3]
  }'::jsonb),

  -- Outcome thresholds
  ('thresholds', '{
    "pass_max": 10,
    "review_max": 19
  }'::jsonb),

  -- Auto-fail trigger options (option indices that trigger immediate FAIL)
  -- Q11 options 4 & 5 (indices 3, 4) are auto-fail
  -- Q13 anything except "yes_certain" is auto-fail
  ('auto_fail_options', '{
    "q11": [3, 4],
    "q13": ["mostly_sure", "unsure", "no"]
  }'::jsonb)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- ============================================
-- QUIZ RESPONSES TABLE
-- Stores all submissions (PASS, REVIEW, FAIL)
-- ============================================

CREATE TABLE IF NOT EXISTS cohort_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),

  -- User data
  email text NOT NULL,

  -- Outcome
  outcome text NOT NULL CHECK (outcome IN ('PASS', 'REVIEW', 'FAIL')),
  score integer,
  fail_reason text,  -- 'commitment_gate', 'autofail_q11', 'score_threshold'

  -- All answers stored as JSON
  answers jsonb NOT NULL,

  -- Q12 free text (required, min 50 chars)
  free_text text NOT NULL,

  -- UTM tracking
  utm_source text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

-- Indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_cohort_responses_created_at ON cohort_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cohort_responses_outcome ON cohort_responses(outcome);
CREATE INDEX IF NOT EXISTS idx_cohort_responses_email ON cohort_responses(email);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on both tables
ALTER TABLE cohort_scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON cohort_responses;
DROP POLICY IF EXISTS "Service role full access" ON cohort_responses;
DROP POLICY IF EXISTS "Allow anonymous reads for config" ON cohort_scoring_config;
DROP POLICY IF EXISTS "Service role update config" ON cohort_scoring_config;
DROP POLICY IF EXISTS "Allow anonymous updates for config" ON cohort_scoring_config;
DROP POLICY IF EXISTS "Allow anonymous inserts for config" ON cohort_scoring_config;

-- Allow anonymous inserts for quiz submissions
CREATE POLICY "Allow anonymous inserts" ON cohort_responses
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON cohort_responses
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anonymous reads for scoring config (needed for client-side scoring)
CREATE POLICY "Allow anonymous reads for config" ON cohort_scoring_config
  FOR SELECT
  USING (true);

-- Allow anonymous updates for scoring config (admin page is password-protected)
CREATE POLICY "Allow anonymous updates for config" ON cohort_scoring_config
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anonymous inserts for scoring config (needed for upsert operations)
CREATE POLICY "Allow anonymous inserts for config" ON cohort_scoring_config
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access to config
CREATE POLICY "Service role full access config" ON cohort_scoring_config
  FOR ALL
  USING (auth.role() = 'service_role');
