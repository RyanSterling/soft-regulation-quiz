-- Migration: Add symptoms column to responses table
-- Replaces has_chronic_pain and medical_clearance columns
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new symptoms column (JSONB to store array of symptom objects)
ALTER TABLE responses
ADD COLUMN IF NOT EXISTS symptoms jsonb DEFAULT '[]'::jsonb;

-- Step 2: Make has_chronic_pain nullable (for backward compatibility with existing data)
-- New submissions will have symptoms instead
ALTER TABLE responses
ALTER COLUMN has_chronic_pain DROP NOT NULL;

-- Step 3: Set default for has_chronic_pain to null for new records
ALTER TABLE responses
ALTER COLUMN has_chronic_pain SET DEFAULT null;

-- Step 4: Create index on symptoms for faster queries
CREATE INDEX IF NOT EXISTS idx_responses_symptoms ON responses USING gin(symptoms);

-- Step 5: Update the analytics view to use symptoms instead of has_chronic_pain
DROP VIEW IF EXISTS analytics_summary;

CREATE VIEW analytics_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE result = 'sensitized') as sensitized_count,
  COUNT(*) FILTER (WHERE result = 'not_sensitized') as not_sensitized_count,
  COUNT(*) FILTER (WHERE symptoms IS NOT NULL AND symptoms != '[]'::jsonb AND NOT symptoms @> '[{"id": "none"}]'::jsonb) as has_symptoms_count,
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

-- Add comment for the new column
COMMENT ON COLUMN responses.symptoms IS 'Array of symptom objects from Q12 multiselect, e.g. [{"id": "back_pain", "label": "Back pain"}]';

-- Optional: If you want to migrate old data, you can run this to convert has_chronic_pain to symptoms
-- UPDATE responses
-- SET symptoms = CASE
--   WHEN has_chronic_pain = true THEN '[{"id": "chronic_pain", "label": "Chronic pain (legacy)"}]'::jsonb
--   ELSE '[]'::jsonb
-- END
-- WHERE symptoms IS NULL OR symptoms = '[]'::jsonb;
