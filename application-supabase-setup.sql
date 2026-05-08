-- 1:1 Business Coaching Application Form Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- COACHING APPLICATIONS TABLE
-- Stores all completed applications (only "Yes" on pricing)
-- ============================================

CREATE TABLE IF NOT EXISTS coaching_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),

  -- Contact info
  name text NOT NULL,
  email text NOT NULL,
  location text,
  timezone text,

  -- All free-text answers stored as JSON
  answers jsonb NOT NULL,
  -- Expected structure:
  -- {
  --   "business_description": "...",
  --   "business_links": "...",
  --   "symptoms": "...",
  --   "already_tried": "...",
  --   "why_now": "...",
  --   "clear_yes": "...",
  --   "anything_else": "..."
  -- }

  -- Revenue range selection
  revenue_range text NOT NULL,

  -- UTM tracking
  utm_source text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_coaching_applications_created_at ON coaching_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_applications_email ON coaching_applications(email);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE coaching_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON coaching_applications;
DROP POLICY IF EXISTS "Service role full access" ON coaching_applications;

-- Allow anonymous inserts for form submissions
CREATE POLICY "Allow anonymous inserts" ON coaching_applications
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access (for admin queries)
CREATE POLICY "Service role full access" ON coaching_applications
  FOR ALL
  USING (auth.role() = 'service_role');
