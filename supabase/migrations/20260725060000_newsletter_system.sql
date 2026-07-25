-- Newsletter system: extend newsletter_subscribers for double opt-in +
-- subscriber management, and add newsletter_campaigns for the composer.
--
-- newsletter_subscribers already exists (id, email, created_at, unique(email))
-- from supabase/newsletter_subscribers.sql. We extend it in place so existing
-- signups are preserved. Existing rows were collected under a single opt-in
-- flow, so they are backfilled as confirmed + active to keep receiving mail.

-- 1. Extend newsletter_subscribers ------------------------------------------
alter table newsletter_subscribers
  add column if not exists name text,
  add column if not exists status text default 'active',
  add column if not exists source text default 'website',
  add column if not exists unsubscribed_at timestamp with time zone,
  add column if not exists unsubscribe_token text,
  add column if not exists confirmed boolean default false,
  add column if not exists confirmed_at timestamp with time zone,
  add column if not exists confirm_token text;

-- Backfill tokens for any rows missing them (defaults are not retroactive for
-- volatile expressions applied per-row, so set explicitly where null).
update newsletter_subscribers
  set unsubscribe_token = encode(gen_random_bytes(32), 'hex')
  where unsubscribe_token is null;

update newsletter_subscribers
  set confirm_token = encode(gen_random_bytes(32), 'hex')
  where confirm_token is null;

-- Treat pre-existing subscribers as confirmed + active.
update newsletter_subscribers
  set confirmed = true,
      confirmed_at = coalesce(confirmed_at, created_at, now()),
      status = coalesce(status, 'active')
  where confirmed is distinct from true;

-- New rows should always carry tokens; enforce sensible defaults going forward.
alter table newsletter_subscribers
  alter column unsubscribe_token set default encode(gen_random_bytes(32), 'hex'),
  alter column confirm_token set default encode(gen_random_bytes(32), 'hex'),
  alter column status set default 'active',
  alter column source set default 'website',
  alter column confirmed set default false;

-- 2. newsletter_campaigns ----------------------------------------------------
create table if not exists newsletter_campaigns (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  title text not null,
  subject text not null,
  preview_text text,
  content_html text,
  content_json text,
  status text default 'draft',
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  sent_count integer default 0,
  failed_count integer default 0,
  open_count integer default 0,
  created_by text default 'Admin'
);

alter table newsletter_campaigns enable row level security;

-- No public policies for either table: all access is server-side via the
-- service role key (getSupabaseAdmin), which bypasses RLS.

-- 3. Indexes -----------------------------------------------------------------
create index if not exists idx_subscribers_email
  on newsletter_subscribers(email);
create index if not exists idx_subscribers_status
  on newsletter_subscribers(status);
create index if not exists idx_subscribers_unsubscribe_token
  on newsletter_subscribers(unsubscribe_token);
create index if not exists idx_subscribers_confirm_token
  on newsletter_subscribers(confirm_token);
create index if not exists idx_campaigns_status
  on newsletter_campaigns(status);
create index if not exists idx_campaigns_scheduled
  on newsletter_campaigns(scheduled_at)
  where status = 'scheduled';
