-- =============================================
-- Events & RSVP Tables Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- EVENTS TABLE - Stores Q&A and other events
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Display settings
  is_active BOOLEAN DEFAULT true,

  -- Zoom/meeting info (optional - can be added later)
  zoom_link TEXT,

  -- Time zone display helpers (stored for display purposes)
  time_pacific TEXT,
  time_eastern TEXT,
  time_uk TEXT,
  time_europe TEXT
);

-- =============================================
-- RSVPS TABLE - Stores RSVPs linked to events
-- =============================================
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Link to event
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Tracking
  utm_source TEXT,
  utm_campaign TEXT,

  -- Prevent duplicate RSVPs per event
  UNIQUE(event_id, email)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Events: Public can read active events, admin can do everything
CREATE POLICY "Allow public read active events" ON events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert events" ON events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update events" ON events
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete events" ON events
  FOR DELETE
  USING (true);

-- RSVPs: Public can insert, admin can read all
CREATE POLICY "Allow public insert rsvps" ON rsvps
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read rsvps" ON rsvps
  FOR SELECT
  USING (true);

CREATE POLICY "Allow delete rsvps" ON rsvps
  FOR DELETE
  USING (true);

-- =============================================
-- INSERT INITIAL EVENT (May 21 Q&A)
-- =============================================
INSERT INTO events (
  title,
  description,
  event_date,
  is_active,
  time_pacific,
  time_eastern,
  time_uk,
  time_europe
) VALUES (
  'Soft Regulation Live Q+A',
  'A live Q&A just for those of you inside Soft Regulation. I''ll be answering as many questions as I can. Nobody will be on camera except me, and questions will be answered via the question box.',
  '2025-05-21T17:30:00Z',
  true,
  '10:30 AM Pacific',
  '1:30 PM Eastern',
  '6:30 PM UK',
  '7:30 PM Central Europe'
);
