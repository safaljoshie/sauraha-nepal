-- Guide reviews are now sign-in gated. Associate each review with the author's
-- auth user and prevent duplicate reviews of the same guide by the same user.
-- (Inserts still happen via the service-role server route, which preserves the
-- pending-moderation queue; see app/api/guide-reviews/submit/route.ts.)
alter table guide_reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Partial unique: one review per user per guide. Legacy anonymous rows
-- (user_id is null) are exempt so this can be applied without a backfill.
create unique index if not exists guide_reviews_user_guide_unique
  on guide_reviews (user_id, guide_id)
  where user_id is not null;

-- Note: update_guide_rating() already recomputes avg_rating/review_count on any
-- status change, so soft-delete flipping a user's reviews to 'removed' will
-- correctly recompute the guide aggregates.
