-- Business reviews, mirroring guide_reviews. Sign-in gated, inserted via the
-- service-role server route with status 'pending' for admin moderation.

-- Rating aggregates on the listing, kept in sync by the trigger below.
alter table business_listings
  add column if not exists avg_rating numeric(3,2) default 0,
  add column if not exists review_count integer default 0;

create table if not exists business_reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default timezone('utc'::text, now()),
  business_id uuid not null references business_listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text not null,
  reviewer_email text,
  reviewer_country text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending',
  visit_date text
);

alter table business_reviews enable row level security;

-- Public may read approved reviews only (mirrors guide_reviews). No anon insert
-- policy: writes go through the service-role route only (matching the
-- 20260721104031 hardening on guide_reviews).
drop policy if exists "Public can view approved business reviews" on business_reviews;
create policy "Public can view approved business reviews"
on business_reviews for select
using (status = 'approved');

-- One review per user per business.
create unique index if not exists business_reviews_user_business_unique
  on business_reviews (user_id, business_id)
  where user_id is not null;

create or replace function update_business_rating()
returns trigger as $$
begin
  update business_listings
  set
    avg_rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from business_reviews
      where business_id = coalesce(new.business_id, old.business_id)
      and status = 'approved'
    ), 0),
    review_count = (
      select count(*)
      from business_reviews
      where business_id = coalesce(new.business_id, old.business_id)
      and status = 'approved'
    )
  where id = coalesce(new.business_id, old.business_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists update_rating_on_business_review on business_reviews;
create trigger update_rating_on_business_review
after insert or update or delete on business_reviews
for each row
execute function update_business_rating();
