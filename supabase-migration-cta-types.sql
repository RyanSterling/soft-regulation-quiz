-- Migration: Update cta_type constraint to use new values
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the old constraint FIRST
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_cta_type_check;

-- Step 2: Update existing records with old values (BEFORE adding new constraint)
UPDATE responses
SET cta_type = CASE
  WHEN cta_type = 'default' THEN 'eligible'
  WHEN cta_type IN ('trust', 'evaluation') THEN 'not_eligible'
  ELSE cta_type
END
WHERE cta_type IN ('default', 'trust', 'evaluation');

-- Step 3: Add the new constraint with updated values
ALTER TABLE responses ADD CONSTRAINT responses_cta_type_check
  CHECK (cta_type IN ('eligible', 'not_eligible'));
