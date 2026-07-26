-- End-user profiles, backing Google OAuth sign-in.
-- Rows are seeded automatically on auth.users insert (handle_new_user), hold the
-- editable display name/country used as the reviewer identity, and carry a
-- soft-delete flag (deleted_at) — accounts are deactivated, never hard-deleted.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now()),
  display_name text,
  country text,
  avatar_url text,
  email text,
  deleted_at timestamptz
);

alter table profiles enable row level security;

-- Owner-only access. These are the first auth.uid() policies in the codebase.
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
-- No INSERT/DELETE policies: rows are created by the trigger below (security
-- definer) and deactivated (soft-deleted) via the service-role server route.

-- Seed a profile from Google identity metadata when a user first signs in.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
