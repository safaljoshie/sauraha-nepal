-- Run in Supabase SQL Editor (analytics for Sauraha AI assistant)

create table if not exists chat_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message text not null,
  response text not null,
  session_id text
);

create index if not exists idx_chat_logs_created_at on chat_logs (created_at desc);

alter table chat_logs enable row level security;

-- No public policies: inserts from API route use service role only.
