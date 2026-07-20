-- blog_posts had RLS enabled but no policy, so anon reads returned nothing and
-- the blog rendered only via the service-role path — a silent single point of
-- failure, and the reason /blog/[slug] prerendered zero paths on Preview
-- deployments (where only the anon key is available).
--
-- The policy itself was already authored in supabase/blog_posts.sql but had
-- never been applied. This migration is the record of applying it, and matches
-- the convention used by business_listings and tour_guides.
drop policy if exists "Public can read published blog posts" on blog_posts;
create policy "Public can read published blog posts"
  on blog_posts
  for select
  to anon, authenticated
  using (status = 'published');
