-- Run in Supabase SQL Editor

create table if not exists category_groups (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null unique,
  label text not null,
  tab_label text not null,
  icon text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  constraint category_groups_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists business_categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null unique,
  group_id uuid not null references category_groups (id) on delete restrict,
  sort_order integer default 0 not null,
  is_active boolean default true not null
);

create index if not exists idx_business_categories_group_sort
  on business_categories (group_id, sort_order, name);

create index if not exists idx_category_groups_active_sort
  on category_groups (is_active, sort_order, slug);

create or replace function set_category_groups_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_category_groups_updated_at on category_groups;
create trigger trg_category_groups_updated_at
before update on category_groups
for each row
execute function set_category_groups_updated_at();

create or replace function set_business_categories_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_business_categories_updated_at on business_categories;
create trigger trg_business_categories_updated_at
before update on business_categories
for each row
execute function set_business_categories_updated_at();

alter table category_groups enable row level security;
alter table business_categories enable row level security;

drop policy if exists "Public read active category groups" on category_groups;
create policy "Public read active category groups"
  on category_groups
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public read active business categories" on business_categories;
create policy "Public read active business categories"
  on business_categories
  for select
  to anon, authenticated
  using (is_active = true);

-- Seed filter groups (idempotent)
insert into category_groups (slug, label, tab_label, icon, sort_order, is_active)
values
  ('stay', 'Stay', 'Stay', 'hotel', 10, true),
  ('eat', 'Eat & Drink', 'Eat & Drink', 'utensils', 20, true),
  ('activities', 'Activities', 'Activities', 'binoculars', 30, true),
  ('transport', 'Transport', 'Transport', 'car', 40, true),
  ('shopping', 'Shopping', 'Shopping', 'shopping-bag', 50, true),
  ('guides', 'Tour Guides', 'Tour Guides', 'compass', 60, true)
on conflict (slug) do update set
  label = excluded.label,
  tab_label = excluded.tab_label,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Seed business categories (idempotent by name)
insert into business_categories (name, group_id, sort_order, is_active)
select v.name, g.id, v.sort_order, true
from (
  values
    ('Hotel', 'stay', 10),
    ('Resort', 'stay', 20),
    ('Guesthouse', 'stay', 30),
    ('Homestay', 'stay', 40),
    ('Restaurant', 'eat', 10),
    ('Cafe', 'eat', 20),
    ('Bar', 'eat', 30),
    ('Tea Shop', 'eat', 40),
    ('Bakery', 'eat', 50),
    ('Street Food', 'eat', 60),
    ('Liquor Shop', 'eat', 70),
    ('Safari', 'activities', 10),
    ('Canoe/Boat', 'activities', 20),
    ('Birdwatching', 'activities', 30),
    ('Cultural Show', 'activities', 40),
    ('Animal Sanctuary', 'activities', 50),
    ('Taxi/Jeep', 'transport', 10),
    ('Bus Service', 'transport', 20),
    ('Cycle Rental', 'transport', 30),
    ('Scooty Rental', 'transport', 40),
    ('Souvenirs', 'shopping', 10),
    ('Clothing', 'shopping', 20),
    ('Tattoo Shop', 'shopping', 30),
    ('Grocery Shop', 'shopping', 40),
    ('Chemist/Pharmacy', 'shopping', 50),
    ('Licensed Guide', 'guides', 10),
    ('Tour Operator', 'guides', 20)
) as v(name, group_slug, sort_order)
join category_groups g on g.slug = v.group_slug
on conflict (name) do update set
  group_id = excluded.group_id,
  sort_order = excluded.sort_order,
  is_active = true;
