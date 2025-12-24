-- Migration: Add ip_address column to responses table
-- This allows tracking IP addresses for rate limiting

-- Add ip_address column to responses table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='responses' AND column_name='ip_address'
    ) THEN
        ALTER TABLE responses ADD COLUMN ip_address text;

        -- Add index for faster rate limit queries
        CREATE INDEX idx_responses_ip_created ON responses(ip_address, created_at DESC);
    END IF;
END $$;

-- Update RLS policies to allow IP address insertion
-- (Already covered by existing "Anyone can insert responses" policy)

COMMENT ON COLUMN responses.ip_address IS 'Client IP address for rate limiting (captured via Cloudflare Worker)';
