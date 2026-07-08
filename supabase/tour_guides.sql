-- Tour guide profiles (separate from business_listings)
create table if not exists tour_guides (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  full_name text not null,
  nickname text,
  photo_url text,
  bio text,
  years_experience integer,
  location text default 'Sauraha, Chitwan',

  phone text,
  whatsapp text,
  email text,
  facebook_url text,
  instagram_url text,
  website_url text,

  licence_number text,
  licence_verified boolean default false,
  is_verified boolean default false,
  verified_at timestamp with time zone,

  languages text[] default '{}',
  expertise text[] default '{}',
  services jsonb default '[]',

  status text default 'pending',
  avg_rating numeric(3,2) default 0,
  review_count integer default 0,

  meta_title text,
  meta_description text
);

alter table tour_guides enable row level security;

drop policy if exists "Public can view approved guides" on tour_guides;
create policy "Public can view approved guides"
on tour_guides for select
using (status = 'approved');

create table if not exists guide_reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  guide_id uuid not null references tour_guides(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  reviewer_country text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending',
  visit_date text,
  tour_type text
);

alter table guide_reviews enable row level security;

drop policy if exists "Public can view approved guide reviews" on guide_reviews;
create policy "Public can view approved guide reviews"
on guide_reviews for select
using (status = 'approved');

drop policy if exists "Anyone can submit a guide review" on guide_reviews;
create policy "Anyone can submit a guide review"
on guide_reviews for insert
with check (true);

create or replace function update_guide_rating()
returns trigger as $$
begin
  update tour_guides
  set
    avg_rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from guide_reviews
      where guide_id = coalesce(new.guide_id, old.guide_id)
      and status = 'approved'
    ), 0),
    review_count = (
      select count(*)
      from guide_reviews
      where guide_id = coalesce(new.guide_id, old.guide_id)
      and status = 'approved'
    ),
    updated_at = timezone('utc'::text, now())
  where id = coalesce(new.guide_id, old.guide_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists update_rating_on_guide_review on guide_reviews;
create trigger update_rating_on_guide_review
after insert or update or delete on guide_reviews
for each row
execute function update_guide_rating();
