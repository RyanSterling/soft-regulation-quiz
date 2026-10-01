-- Add columns for tracking outreach status
ALTER TABLE success_stories
ADD COLUMN youtube_outreach BOOLEAN DEFAULT FALSE;

ALTER TABLE success_stories
ADD COLUMN testimonial_outreach BOOLEAN DEFAULT FALSE;
