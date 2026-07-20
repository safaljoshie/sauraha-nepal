-- Same latent bug as blog_posts, on three more tables: RLS is enabled but no
-- policy was ever applied, so the anon fallback in lib/site-settings.ts and
-- lib/site-content.ts is dead and these reads succeed only via the service-role
-- key. All three are rendered on public pages (SiteFooter on every page, the
-- homepage hero, and /contact), so today a service-role failure would silently
-- blank them rather than error.
--
-- These policy definitions are copied verbatim from the intent already authored
-- in supabase/site_settings.sql and supabase/site_content.sql, which had never
-- been applied to the database.

-- Footer contact details etc. — rendered site-wide.
drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings"
  on site_settings
  for select
  to anon, authenticated
  using (true);

-- /contact page copy.
drop policy if exists "Public read contact page content" on contact_page_content;
create policy "Public read contact page content"
  on contact_page_content
  for select
  to anon, authenticated
  using (true);

-- Homepage hero image/video. Inactive rows stay hidden from anon.
drop policy if exists "Public read active hero media" on hero_media;
create policy "Public read active hero media"
  on hero_media
  for select
  to anon, authenticated
  using (is_active = true);
