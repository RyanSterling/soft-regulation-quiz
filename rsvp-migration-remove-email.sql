-- =============================================
-- Migration: Make email optional in rsvps table
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop the unique constraint on event_id + email
ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS rsvps_event_id_email_key;

-- Make email nullable
ALTER TABLE rsvps ALTER COLUMN email DROP NOT NULL;
