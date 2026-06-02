-- Run in Supabase SQL Editor

create table if not exists site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function set_site_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_site_settings_updated_at on site_settings;
create trigger trg_site_settings_updated_at
before update on site_settings
for each row
execute function set_site_settings_updated_at();

alter table site_settings enable row level security;

drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings"
  on site_settings
  for select
  to anon, authenticated
  using (true);

insert into site_settings (key, value) values
  ('facebook_url', 'https://facebook.com/saurahanepal'),
  ('instagram_url', 'https://instagram.com/saurahanepal'),
  ('twitter_url', ''),
  ('tiktok_url', ''),
  ('youtube_url', ''),
  ('whatsapp_number', ''),
  ('email', 'hello@mail.saurahanepal.com')
on conflict (key) do nothing;
