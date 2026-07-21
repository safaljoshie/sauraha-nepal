# Supabase schema

## `migrations/` is authoritative

Anything under `supabase/migrations/` has been applied to the project and is
recorded in Supabase's migration history. Filenames match the recorded versions.

**Workflow for any new schema change:** write the migration file, commit it,
then apply it. Not the other way round — a change applied first and documented
later exists only in the remote history, and nothing in the repo records that it
happened.

One gotcha: applying through the Supabase MCP assigns its **own** timestamp and
ignores whatever version you put in the filename. After applying, check
`list_migrations` and rename the file to the version actually recorded, or local
and remote silently disagree — the file looks unapplied and the remote version
has no file. The `20260720111446` / `111601` / `111739` migrations here were
renamed for exactly that reason.

Data backfills are not migrations. They live in `scripts/` (see
`scripts/backfill-listing-coordinates.ts`) so they stay re-runnable and don't
bake row IDs into schema history.

## The loose `*.sql` files are historical, not a source of truth

The 18 `.sql` files directly in `supabase/` predate the migrations directory.
They record *intent at the time of writing* and are known to have drifted from
what is actually deployed. They are kept for reference, but do not assume
running them reproduces production.

Demonstrated drift, found 2026-07-20 by comparing each file against `pg_policies`:

| File | Drift |
|---|---|
| `blog_posts.sql` | Declared a public-read policy that had **never been applied**. RLS was on with zero policies, so anon reads returned nothing and the blog rendered only via the service-role key. Fixed in `20260720110509`. |
| `site_settings.sql`, `site_content.sql` | Same pattern, three more tables: `site_settings`, `contact_page_content`, `hero_media`. Fixed in `20260720111446`. |
| `team_members.sql` | No policy authored at all, though `/about` reads the table. Fixed in `20260720111601`. |
| `chat_logs.sql` | Says "No public policies", but an `INSERT` policy granting `public` with_check(true) was deployed by hand — an unauthenticated write path. Removed in `20260720111739`. |
| `tour_guides.sql` (and `migrations/20260708120000_tour_guides.sql:66-69`) | Granted `INSERT` on `guide_reviews` to `public` with check (true) — anyone with the anon key could inject rows straight into the admin moderation queue. Unused: submissions go through the service role. Removed in `20260721104031`. Unlike the `chat_logs` case this was authored intent, not hand-applied drift. |
| `rls-business-listings.sql` | Declares `"Public read approved listings"`, which was never applied. `business_listings` instead carries two *differently named* policies with identical `status = 'approved'` predicates. Running this file would add a redundant third. |

## Current RLS posture

Verified end-to-end with the anon key on 2026-07-20.

Readable by anon — all rendered on public pages:

| Table | Predicate |
|---|---|
| `business_listings` | `status = 'approved'` |
| `tour_guides` | `status = 'approved'` |
| `guide_reviews` | approved only |
| `blog_posts` | `status = 'published'` |
| `site_settings` | all rows |
| `contact_page_content` | all rows |
| `hero_media` | `is_active = true` |
| `team_members` | `is_active = true` |
| `business_categories`, `category_groups` | active only |

Blocked to anon — service-role only, confirmed returning zero rows:
`team_resources`, `team_itineraries`, `team_calendar_notices`,
`content_calendar`, `newsletter_subscribers`, `chat_logs`.

**No table grants anon `INSERT`, `UPDATE` or `DELETE`.** Every write goes through
an API route using the service role. Two tables previously did — `chat_logs`
(`20260720111739`) and `guide_reviews` (`20260721104031`) — and both were
unauthenticated write paths reachable with the publicly-shipped anon key. If a
future policy needs a public write, that is a deliberate decision to argue for,
not a default to inherit.

## Why the anon policies matter even though the app uses the service role

Every public read helper (`lib/listings-fetch.ts`, `lib/blog-db.ts`,
`lib/site-content.ts`, `lib/team-members.ts`, …) tries the service-role client
first and falls back to anon. When a table has RLS on and no policy, that
fallback is dead — the read works in production purely because the service-role
key is present, and fails silently everywhere else.

That is why Preview deployments (anon key only) rendered an empty blog and an
About page showing a single hardcoded founder. The policies restore the fallback
and remove a single point of failure in production.

## Known cosmetic issue

`business_listings` has two identical `SELECT` policies
(`"Public can read approved listings for homepage"` and
`"Public can view approved listings"`), both `using (status = 'approved')`.
Permissive policies OR together, so behaviour is correct; one could be dropped.
