-- Migration: Fix score constraints for anxious response weighting
-- URGENT FIX: The anxious response questions (Q10, Q11) add weighted score to baseline
-- but the database constraints were never updated to allow for this.
--
-- This causes "There was an error processing your quiz" for users who score high on Q10/Q11.
--
-- Run this migration IMMEDIATELY in Supabase SQL Editor.

-- Fix baseline score constraint to allow for anxious response weighting
-- Max baseline = Q7+Q8+Q9 (12) + (Q10+Q11)*1.5 (12) = 24
ALTER TABLE responses
DROP CONSTRAINT IF EXISTS responses_score_baseline_check;

ALTER TABLE responses
ADD CONSTRAINT responses_score_baseline_check
CHECK (score_baseline >= 3 AND score_baseline <= 24);

-- Fix total score constraint
-- Max total = trigger(12) + recovery(12) + baseline(24) = 48
ALTER TABLE responses
DROP CONSTRAINT IF EXISTS responses_score_total_check;

ALTER TABLE responses
ADD CONSTRAINT responses_score_total_check
CHECK (score_total >= 9 AND score_total <= 48);
