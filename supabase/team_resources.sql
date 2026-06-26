-- Team Resources file library (admin upload, team read-only download via API)
-- Run in Supabase SQL Editor, then create Storage bucket "team-resources" (Private / Public OFF)

CREATE TABLE IF NOT EXISTS team_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size_kb integer,
  uploaded_by text DEFAULT 'Admin'
);

ALTER TABLE team_resources ENABLE ROW LEVEL SECURITY;

-- No public policies — accessed only via server-side API routes using the service role key.

-- Storage: create a PRIVATE bucket named "team-resources" in Supabase Dashboard
-- (Storage → New bucket → Public OFF). The admin upload API will also attempt to
-- create this bucket automatically on first upload when using the service role key.
