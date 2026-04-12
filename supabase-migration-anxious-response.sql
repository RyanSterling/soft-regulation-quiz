-- Migration: Add anxious response questions (Q10, Q11)
-- These questions identify people with compulsive/fear-based responses to symptoms
-- Run this migration in Supabase SQL Editor

-- Add columns for new Q10 and Q11 (anxious response questions)
ALTER TABLE responses
ADD COLUMN IF NOT EXISTS q10_answer integer CHECK (q10_answer IS NULL OR (q10_answer >= 1 AND q10_answer <= 4));

ALTER TABLE responses
ADD COLUMN IF NOT EXISTS q11_answer integer CHECK (q11_answer IS NULL OR (q11_answer >= 1 AND q11_answer <= 4));

-- Add comments for documentation
COMMENT ON COLUMN responses.q10_answer IS 'Compulsive checking/researching/reassurance-seeking (1-4 scale)';
COMMENT ON COLUMN responses.q11_answer IS 'Chronic fear and mental energy on symptoms (1-4 scale)';

-- Note: Existing columns remain unchanged:
-- - has_chronic_pain: Still stores chronic pain answer (now sourced from Q12 in frontend)
-- - medical_clearance: Still stores clearance answer (now sourced from Q13 in frontend)
