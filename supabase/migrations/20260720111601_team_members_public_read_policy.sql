-- team_members has RLS enabled and no policy, and unlike site_settings /
-- contact_page_content / hero_media there was never one authored in the repo —
-- so this is new intent, not restoring an unapplied policy.
--
-- /about renders active team members via lib/team-members.ts, which falls back
-- to a single hardcoded founder entry when the read returns nothing. That
-- fallback masks the failure: on any deploy without the service-role key the
-- About page quietly shows one person instead of the whole team.
--
-- Scoped to is_active so deactivated members stay hidden from anon, matching how
-- fetchActiveTeamMembers already filters.
drop policy if exists "Public read active team members" on team_members;
create policy "Public read active team members"
  on team_members
  for select
  to anon, authenticated
  using (is_active = true);
