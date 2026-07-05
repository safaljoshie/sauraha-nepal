-- Run in Supabase SQL Editor (homepage newsletter signups)

create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint newsletter_subscribers_email_unique unique (email)
);

create index if not exists idx_newsletter_subscribers_created_at
  on newsletter_subscribers (created_at desc);

alter table newsletter_subscribers enable row level security;

-- No public policies: inserts from API route use service role only.
