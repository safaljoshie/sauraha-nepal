-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  scheduled_date date NOT NULL,
  content_title text NOT NULL,
  platform text NOT NULL,
  status text DEFAULT 'draft',
  owner text NOT NULL,
  notes text,
  link text
);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- No public policies — accessed only via server API routes with service role key.
