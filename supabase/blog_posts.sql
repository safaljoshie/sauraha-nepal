-- Run in Supabase SQL Editor

create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  tag text,
  read_time text,
  status text default 'draft' not null,
  author text default 'Sauraha Nepal Team',
  meta_title text,
  meta_description text,
  published_at timestamp with time zone
);

create index if not exists idx_blog_posts_status_published
  on blog_posts (status, published_at desc);

create or replace function set_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_blog_posts_updated_at on blog_posts;
create trigger trg_blog_posts_updated_at
before update on blog_posts
for each row
execute function set_blog_posts_updated_at();

alter table blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on blog_posts;
create policy "Public can read published blog posts"
  on blog_posts
  for select
  to anon, authenticated
  using (status = 'published');
