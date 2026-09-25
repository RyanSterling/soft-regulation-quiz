-- Add column for what specifically from the course helped
ALTER TABLE success_stories
ADD COLUMN what_helped TEXT;

-- Add column for symptoms experienced
ALTER TABLE success_stories
ADD COLUMN symptoms TEXT;

-- Make them required for new submissions (optional for existing)
-- We'll handle the required validation in the frontend
