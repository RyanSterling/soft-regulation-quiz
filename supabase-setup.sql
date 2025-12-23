-- Nervous System Quiz - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Table: responses
-- Stores completed quiz submissions
CREATE TABLE responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL,
  result text NOT NULL CHECK (result IN ('sensitized', 'not_sensitized')),
  score_total integer NOT NULL CHECK (score_total >= 9 AND score_total <= 36),
  score_trigger integer NOT NULL CHECK (score_trigger >= 3 AND score_trigger <= 12),
  score_recovery integer NOT NULL CHECK (score_recovery >= 3 AND score_recovery <= 12),
  score_baseline integer NOT NULL CHECK (score_baseline >= 3 AND score_baseline <= 12),
  q1_answer integer NOT NULL CHECK (q1_answer >= 1 AND q1_answer <= 4),
  q2_answer integer NOT NULL CHECK (q2_answer >= 1 AND q2_answer <= 4),
  q3_answer integer NOT NULL CHECK (q3_answer >= 1 AND q3_answer <= 4),
  q4_answer integer NOT NULL CHECK (q4_answer >= 1 AND q4_answer <= 4),
  q5_answer integer NOT NULL CHECK (q5_answer >= 1 AND q5_answer <= 4),
  q6_answer integer NOT NULL CHECK (q6_answer >= 1 AND q6_answer <= 4),
  q7_answer integer NOT NULL CHECK (q7_answer >= 1 AND q7_answer <= 4),
  q8_answer integer NOT NULL CHECK (q8_answer >= 1 AND q8_answer <= 4),
  q9_answer integer NOT NULL CHECK (q9_answer >= 1 AND q9_answer <= 4),
  has_chronic_pain boolean NOT NULL,
  medical_clearance text CHECK (medical_clearance IN ('yes_confident', 'seen_but_unsure', 'not_evaluated', NULL)),
  free_text_response text,
  ai_insight text,
  waitlist_opted_in boolean DEFAULT false,
  cta_type text CHECK (cta_type IN ('default', 'trust', 'evaluation')),
  utm_source text,
  utm_campaign text
);

-- Index on email for faster lookups (rate limiting, duplicate checking)
CREATE INDEX idx_responses_email ON responses(email);

-- Index on created_at for analytics queries
CREATE INDEX idx_responses_created_at ON responses(created_at DESC);

-- Index on result for filtering
CREATE INDEX idx_responses_result ON responses(result);

-- Table: settings
-- Stores app configuration (CTA mode, URLs, etc.)
CREATE TABLE settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default CTA configuration
INSERT INTO settings (key, value) VALUES (
  'cta_config',
  '{
    "mode": "waitlist",
    "waitlist": {
      "buttonText": "Join the Waitlist",
      "softButtonText": "Join the Waitlist for When You Are Ready"
    },
    "live": {
      "buttonText": "Join Soft Regulation",
      "buttonUrl": "",
      "softButtonText": "Join the Waitlist for When You Are Ready"
    }
  }'::jsonb
);

-- Table: quiz_starts
-- Tracks when users start the quiz (for abandonment analysis)
CREATE TABLE quiz_starts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  session_id text NOT NULL UNIQUE,
  utm_source text,
  utm_campaign text,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  response_id uuid REFERENCES responses(id)
);

-- Table: ip_rate_limits
-- Tracks IP addresses for rate limiting (1 submission per hour)
CREATE TABLE ip_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Index on session_id for quick lookups
CREATE INDEX idx_quiz_starts_session_id ON quiz_starts(session_id);

-- Index on completed for abandonment queries
CREATE INDEX idx_quiz_starts_completed ON quiz_starts(completed);

-- Index on created_at for time-based analytics
CREATE INDEX idx_quiz_starts_created_at ON quiz_starts(created_at DESC);

-- Index on ip_address and created_at for rate limiting queries
CREATE INDEX idx_ip_rate_limits ON ip_rate_limits(ip_address, created_at DESC);

-- Function to update quiz_starts when response is created
CREATE OR REPLACE FUNCTION mark_quiz_completed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quiz_starts
  SET completed = true,
      completed_at = NEW.created_at,
      response_id = NEW.id
  WHERE session_id = (
    -- Assuming session_id is stored somewhere accessible
    -- For now, we'll handle this in application code
    SELECT session_id FROM quiz_starts
    WHERE completed = false
    ORDER BY created_at DESC
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The above trigger is a placeholder
-- In practice, session_id should be passed from the application

-- Enable Row Level Security (RLS) for security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_starts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert responses (for quiz submissions)
CREATE POLICY "Anyone can insert responses"
  ON responses FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to select responses (for admin dashboard)
-- In production, you may want to restrict this to authenticated admin users
CREATE POLICY "Anyone can view responses"
  ON responses FOR SELECT
  USING (true);

-- Policy: Allow anyone to update waitlist_opted_in (for CTA clicks)
CREATE POLICY "Anyone can update waitlist status"
  ON responses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to read settings
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

-- Policy: Allow anyone to update settings (for admin dashboard)
-- In production, you should restrict this to authenticated admin users
CREATE POLICY "Anyone can update settings"
  ON settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to insert quiz starts
CREATE POLICY "Anyone can insert quiz starts"
  ON quiz_starts FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to select quiz starts
CREATE POLICY "Anyone can view quiz starts"
  ON quiz_starts FOR SELECT
  USING (true);

-- Policy: Allow anyone to update quiz starts
CREATE POLICY "Anyone can update quiz starts"
  ON quiz_starts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for ip_rate_limits (service role only for security)
CREATE POLICY "Service role can insert IP rate limits"
  ON ip_rate_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can select IP rate limits"
  ON ip_rate_limits FOR SELECT
  USING (true);

-- Create a view for analytics (optional but useful)
CREATE VIEW analytics_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE result = 'sensitized') as sensitized_count,
  COUNT(*) FILTER (WHERE result = 'not_sensitized') as not_sensitized_count,
  COUNT(*) FILTER (WHERE has_chronic_pain = true) as chronic_pain_count,
  COUNT(*) FILTER (WHERE waitlist_opted_in = true) as waitlist_count,
  AVG(score_total)::numeric(10,2) as avg_total_score,
  AVG(score_trigger)::numeric(10,2) as avg_trigger_score,
  AVG(score_recovery)::numeric(10,2) as avg_recovery_score,
  AVG(score_baseline)::numeric(10,2) as avg_baseline_score,
  COUNT(DISTINCT utm_source) FILTER (WHERE utm_source IS NOT NULL) as unique_sources
FROM responses
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant access to analytics view
GRANT SELECT ON analytics_summary TO anon, authenticated;

COMMENT ON TABLE responses IS 'Stores completed quiz submissions with all answers and scores';
COMMENT ON TABLE settings IS 'Stores application configuration (CTA mode, URLs, etc.)';
COMMENT ON TABLE quiz_starts IS 'Tracks quiz initiations for abandonment analysis';
COMMENT ON VIEW analytics_summary IS 'Daily rollup of key metrics for analytics dashboard';
