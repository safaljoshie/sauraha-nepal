-- Favourites: signed-in users can save listings and guides.
-- No moderation; owner-only RLS for select/insert/delete.

create table if not exists favourites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'guide')),
  target_id uuid not null,
  unique (user_id, target_type, target_id)
);

create index if not exists favourites_user_id_idx on favourites (user_id);
create index if not exists favourites_target_idx on favourites (target_type, target_id);

alter table favourites enable row level security;

drop policy if exists "Users can view own favourites" on favourites;
create policy "Users can view own favourites"
  on favourites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own favourites" on favourites;
create policy "Users can insert own favourites"
  on favourites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favourites" on favourites;
create policy "Users can delete own favourites"
  on favourites for delete
  using (auth.uid() = user_id);
