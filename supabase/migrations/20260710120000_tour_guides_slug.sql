ALTER TABLE tour_guides ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS tour_guides_slug_unique
  ON tour_guides (slug)
  WHERE slug IS NOT NULL;
