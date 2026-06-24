-- Run in Supabase SQL Editor (team calendar notice board)
CREATE TABLE IF NOT EXISTS team_calendar_notices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_pinned boolean DEFAULT false,
  is_active boolean DEFAULT true,
  expires_at date
);

ALTER TABLE team_calendar_notices ENABLE ROW LEVEL SECURITY;

-- No public policies — server API routes only (service role key).
