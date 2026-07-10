-- Run in Supabase SQL Editor (name field is full_name on tour_guides).
-- Test on one row first:
--   SELECT id, full_name FROM tour_guides LIMIT 1;
--   UPDATE tour_guides SET slug = LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9]+', '-', 'g')) WHERE id = '<one-id>';

ALTER TABLE tour_guides ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS tour_guides_slug_unique
  ON tour_guides (slug)
  WHERE slug IS NOT NULL;

UPDATE tour_guides
SET slug = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(TRIM(full_name), '[^a-zA-Z0-9]+', '-', 'g')))
WHERE slug IS NULL OR slug = '';

-- Fallback for empty slugs
UPDATE tour_guides
SET slug = 'guide-' || LEFT(id::text, 8)
WHERE slug IS NULL OR slug = '';

-- Resolve duplicate slugs by appending a short id suffix
WITH ranked AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM tour_guides
  WHERE slug IS NOT NULL
)
UPDATE tour_guides AS g
SET slug = r.slug || '-' || LEFT(g.id::text, 8)
FROM ranked AS r
WHERE g.id = r.id
  AND r.rn > 1;
