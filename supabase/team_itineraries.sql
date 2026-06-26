-- Team Itinerary file library (admin upload, team read-only download via API)
-- Uses the same private "team-resources" Storage bucket with paths under itineraries/

CREATE TABLE IF NOT EXISTS team_itineraries (
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

ALTER TABLE team_itineraries ENABLE ROW LEVEL SECURITY;

-- No public policies — accessed only via server-side API routes using the service role key.
