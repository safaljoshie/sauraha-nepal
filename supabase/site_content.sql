-- Run in Supabase SQL Editor

create table if not exists contact_page_content (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  heading text not null,
  subheading text,
  address text,
  phone text,
  whatsapp text,
  email text,
  response_time text
);

create table if not exists hero_media (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('image', 'video')),
  url text not null,
  poster_url text,
  alt_text text,
  is_active boolean default true not null,
  priority integer default 0 not null
);

create index if not exists idx_hero_media_active_priority
  on hero_media (is_active, priority, created_at);

create or replace function set_contact_page_content_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_contact_page_content_updated_at on contact_page_content;
create trigger trg_contact_page_content_updated_at
before update on contact_page_content
for each row
execute function set_contact_page_content_updated_at();

create or replace function set_hero_media_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_hero_media_updated_at on hero_media;
create trigger trg_hero_media_updated_at
before update on hero_media
for each row
execute function set_hero_media_updated_at();

-- Public read for site-facing pages (admin writes use service role)
alter table contact_page_content enable row level security;
alter table hero_media enable row level security;

drop policy if exists "Public read contact page content" on contact_page_content;
create policy "Public read contact page content"
  on contact_page_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read active hero media" on hero_media;
create policy "Public read active hero media"
  on hero_media
  for select
  to anon, authenticated
  using (is_active = true);
