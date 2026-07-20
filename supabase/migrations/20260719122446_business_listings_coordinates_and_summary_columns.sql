-- Persisted geocoding: coordinates never change, so resolving them per render
-- (serially, with a 1.1s Nominatim rate-limit sleep) does not belong in a
-- serving path. Populated by scripts/backfill-listing-coordinates.ts — that is
-- data rather than schema, so it is deliberately not part of this migration.
alter table business_listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists geocoded_at timestamptz;

comment on column business_listings.geocoded_at is
  'Null means coordinates have never been resolved; set by scripts/backfill-listing-coordinates.ts';

-- Summary columns for list views, so the directory grid stops transferring the
-- full description and the entire photo_links blob for every row.
alter table business_listings
  add column if not exists cover_photo_url text
    generated always as (nullif((regexp_match(coalesce(photo_links,''), '(\S+)'))[1], '')) stored;

alter table business_listings
  add column if not exists description_preview text
    generated always as (left(coalesce(description,''), 160)) stored;
