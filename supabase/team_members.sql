-- Run in Supabase SQL Editor
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text not null,
  image text not null,
  bio text,
  display_order integer default 0 not null,
  is_active boolean default true not null
);

create index if not exists idx_team_members_active_order
  on team_members (is_active, display_order, created_at);

create or replace function set_team_members_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_team_members_updated_at on team_members;
create trigger trg_team_members_updated_at
before update on team_members
for each row
execute function set_team_members_updated_at();
