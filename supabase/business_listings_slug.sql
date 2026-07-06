-- Run in Supabase SQL Editor (table is business_listings; name field is business_name).
-- Test on one row first:
--   SELECT id, business_name FROM business_listings LIMIT 1;
--   UPDATE business_listings SET slug = LOWER(REGEXP_REPLACE(TRIM(business_name), '[^a-zA-Z0-9]+', '-', 'g')) WHERE id = '<one-id>';

ALTER TABLE business_listings ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS business_listings_slug_unique
  ON business_listings (slug)
  WHERE slug IS NOT NULL;

-- Backfill slugs from business_name
UPDATE business_listings
SET slug = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(TRIM(business_name), '[^a-zA-Z0-9]+', '-', 'g')))
WHERE slug IS NULL;

-- Fallback for empty slugs
UPDATE business_listings
SET slug = 'listing-' || LEFT(id::text, 8)
WHERE slug IS NULL OR slug = '';

-- Resolve duplicate slugs by appending a short id suffix
WITH ranked AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM business_listings
  WHERE slug IS NOT NULL
)
UPDATE business_listings AS b
SET slug = r.slug || '-' || LEFT(b.id::text, 8)
FROM ranked AS r
WHERE b.id = r.id
  AND r.rn > 1;
