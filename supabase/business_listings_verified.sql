-- Run in Supabase SQL Editor
alter table business_listings
  add column if not exists verified boolean not null default false;

comment on column business_listings.verified is
  'When true, shows the official Sauraha Nepal verified badge on the public listing.';
