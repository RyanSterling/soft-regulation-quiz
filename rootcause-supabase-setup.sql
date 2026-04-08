-- Root Cause Quiz - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Table: rootcause_responses
-- Stores completed root cause quiz submissions with flexible JSONB storage
CREATE TABLE rootcause_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL,
  answers jsonb NOT NULL,
  ai_assessment text,
  free_text_response text,
  utm_source text,
  utm_campaign text
);

-- Index on email for faster lookups
CREATE INDEX idx_rootcause_responses_email ON rootcause_responses(email);

-- Index on created_at for analytics queries
CREATE INDEX idx_rootcause_responses_created_at ON rootcause_responses(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE rootcause_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert responses (for quiz submissions)
CREATE POLICY "Anyone can insert rootcause_responses"
  ON rootcause_responses FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to select responses (for admin if needed later)
CREATE POLICY "Anyone can view rootcause_responses"
  ON rootcause_responses FOR SELECT
  USING (true);

COMMENT ON TABLE rootcause_responses IS 'Stores completed root cause quiz submissions with AI assessments';
