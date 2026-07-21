# Follow-up: close out the remaining free-tier costs

## Context

The main optimisation shipped (PR #4, merged) and the production dashboards confirm it worked:

| Metric (12h) | Before | After |
|---|---|---|
| ISR write units | 3,000 | **593** (−80%) |
| ISR read units | 821 | 2,200 |
| read:write ratio | 0.27 | **3.7** (inverted) |
| Time-based revalidations | 226 | **16** (−93%) |
| Active CPU | 1m | **8s** (−87%) |
| Function invocations | — | 15, 0% errors |
| Image transformations | — | 7 (no quota risk) |

Four things remain, found while reading those dashboards. Two cost quota, one is a live security hole, one is a health warning that may not be actionable at all.

Also confirmed as **non-issues**, no work planned:
- The 554 `401`s in the Supabase dashboard were my own invalid-key verification build (counts 137/137/136 match a 196-page build). Last 24h of API logs contain zero 401s.
- The five `rls_enabled_no_policy` advisories (`content_calendar`, `newsletter_subscribers`, `team_calendar_notices`, `team_itineraries`, `team_resources`) are correct — service-role-only by design, already documented in `supabase/README.md`.

### Decision taken

Weather moves **client-side** rather than just raising its TTL — the homepage ends up with no clock at all, and weather gets *fresher* rather than staler.

---

## Stage 1 — Remove unauthenticated insert on `guide_reviews`

Best value-to-risk in the set: closes a live public write path, no application code changes.

Supabase advisor WARN: policy `"Anyone can submit a guide review"`, `INSERT`, role `public`, `with_check: true`. The anon key ships in the client bundle, so anyone can insert unlimited rows and flood the moderation queue.

Verified unused by the app: `app/api/guide-reviews/submit/route.ts:51` inserts via `getSupabaseAdmin()` (service role, bypasses RLS). A grep for `guide_reviews` across `app/`, `components/`, `lib/` returns only server-side call sites; `components/guides/` has zero Supabase references.

This is the exact situation already handled for `chat_logs` in `20260720111739_drop_anon_insert_on_chat_logs.sql` — follow that precedent:

```sql
drop policy if exists "Anyone can submit a guide review" on guide_reviews;
```

The `SELECT` policy `"Public can view approved guide reviews"` stays. Also update the drift table and "Current RLS posture" section in `supabase/README.md`.

**Workflow, per `supabase/README.md`:** write the migration file → commit → `apply_migration` → `list_migrations` → **rename the file to the timestamp Supabase actually recorded** → amend. Skipping the rename silently diverges local from remote.

**Verify:** anon-key insert must fail; then submit a review through the real UI form and confirm it still lands (proves the service-role path is intact); advisor WARN disappears.

---

## Stage 2 — Decouple weather from homepage regeneration

**The measurement that pins this down** — from `.next/prerender-manifest.json`:

```
/          initialRevalidateSeconds = 1800   ← the weather fetch
/listings  initialRevalidateSeconds = false
/about     initialRevalidateSeconds = false
```

`/` is the only route in the app carrying a clock, and `lib/sauraha-weather.ts:63`'s `next: { revalidate: 1800 }` is the entire cause. Each regeneration re-runs six Supabase calls (`app/(site)/page.tsx:60-67`) plus a seventh in `generateMetadata` — ~336 queries/day for a weather pill.

Note: `export const revalidate = false` on the page would **not** fix this. Per `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md:192`, an individual fetch may set a *lower* revalidate and that wins for the whole route. The fetch itself has to move.

### Changes

**New `app/api/weather/route.ts`** — follow the `app/api/guides/route.ts` shape (named `GET`, `NextResponse.json({ weather })`, `console.error("GET /api/weather error:", error)` + 500):

```ts
export const dynamic = "force-static"   // required — revalidate alone does NOT cache a route handler
export const revalidate = 1800
```

Verified in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md:51`: *"Route Handlers are not cached by default… To cache a `GET` method, use a route config option such as `export const dynamic = 'force-static'`."*

**`lib/sauraha-weather.ts:63`** — drop `{ next: { revalidate: 1800 } }`; the route segment owns the TTL now.

**`components/home/HeroWeather.tsx`** — add `"use client"`; fetch on mount using the house pattern from `components/admin/AdminNoticeBoard.tsx:28-63` (`useCallback` loader + `useEffect`, three `useState`s, `finally { setLoading(false) }`). Render `loading → <HeroWeatherSkeleton/>`, `!weather → null` (matching today's behaviour when the fetch fails), else the existing JSX unchanged. `HeroWeatherSkeleton` stays exported from this file.

**Delete `components/home/HeroWeatherSlot.tsx`.**

**`components/home/HomeHero.tsx:43-47`** — replace the `<Suspense>` wrapper with a bare `<HeroWeather />`, and remove the now-dead `Suspense` / `HeroWeatherSlot` / `HeroWeatherSkeleton` imports (line 44 is the file's only `Suspense` use, so it will otherwise fail lint).

No bundle cost: `SiteIcon` is already in the client bundle via `Navbar`. No layout shift: `HeroWeatherSkeleton` is already sized identically (`h-[34px] w-[108px]` with sm/md variants).

**Verify:** rebuild and assert `/` now reports `initialRevalidateSeconds = false` in `.next/prerender-manifest.json`, and `/api/weather` appears with `1800`. On Preview, hit `/api/weather` twice and confirm `x-vercel-cache` goes `MISS` → `HIT`. Then check Supabase API logs 24h later: the six-query homepage batch should appear only on deploys and admin saves.

**Accepted risk:** if open-meteo is down when the route regenerates, the pill is absent for up to 30 min — same failure mode as today, self-healing.

---

## Stage 3 — Route social and JSON-LD images through the optimizer

Production logs show `Googlebot-Image/1.0` and `facebookexternalhit/1.1` pulling full-size originals from Supabase Storage. Page HTML is clean (0 raw Supabase `<img>` srcs across 136 pages) — the leak is entirely in metadata and JSON-LD.

Root cause, `lib/seo.ts:137-139` — module-private and passes any `http…` URL straight through:

```ts
function absoluteImageUrl(image: string) {
  return image.startsWith("http") ? image : `${SITE_URL}${image}`
}
```

**This is safe for social crawlers — verified in the Next 16.2.6 source, not inferred.** `node_modules/next/dist/server/image-optimizer.js:222-225` does `accept.includes(mimeType) ? mimeType : ''` — a literal substring check. A crawler sending `Accept: */*` negotiates to `image/webp`, but `"*/*".includes("image/webp")` is `false`, so it returns `''`, and lines 1117-1123 then fall back to the **original upstream format**. Browsers get WebP; Facebook/Twitter/Slack get resized JPEG. Egress drops either way.

### New helper in `lib/image.ts`

`lib/image.ts` already owns `DEFAULT_IMAGE_QUALITY` and `isNextOptimizedImageSrc`; `SITE_URL` comes from `lib/blog-posts.ts` (a 2-line constants module, so no coupling cost). Export `socialImageUrl(src)` with four branches:

1. empty/null → `${SITE_URL}${DEFAULT_OG_IMAGE}`
2. starts with `/` → `${SITE_URL}${src}`, **no optimizer** (`/og-image.jpg` is already 1200×630 and local)
3. `isNextOptimizedImageSrc(src)` → `${SITE_URL}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=${DEFAULT_IMAGE_QUALITY}`
4. any other remote host → unchanged passthrough

Branch 4 is **not optional**: a host absent from `remotePatterns` makes `/_next/image` return 400, which would break the OG image outright rather than degrade it. Reusing the existing `isNextOptimizedImageSrc` guard is the point of putting this in `lib/image.ts`.

Add a comment in `next.config.ts` noting that `1200` in `deviceSizes` and `75` in `qualities` are **load-bearing** for these URLs — trimming either would 400 every OG image site-wide with no local signal.

### Thread through all eight sites

Delete the private `absoluteImageUrl` and replace with `socialImageUrl` at:

| Location | Emits today |
|---|---|
| `lib/seo.ts:211,236,242` `buildListingDetailMetadata` | raw Supabase |
| `lib/seo.ts:274,290,296` `buildBlogPostMetadata` | raw Supabase |
| `lib/seo.ts:302,308` `articleJsonLd` | raw Supabase |
| `app/(site)/page.tsx:29,47,53` | `poster_url`, **not absolutised** |
| `app/(site)/guides/[id]/page.tsx:84,91` | `photo_url`, **not absolutised** |
| `lib/guides-seo.ts:329` | `photo_url` raw |
| `components/home/HomeJsonLd.tsx:75` | raw, **not absolutised** |
| `app/(site)/listings/[id]/page.tsx:278` | `photos[0]`, **not absolutised** |

Four of these never called `absoluteImageUrl` at all — emitting non-absolute URLs into `og:image` is a correctness bug independent of egress. Also fold in `lib/seo.ts`'s `listingJsonLd`, which has a third copy of the same inline branch.

**JSON-LD uses the same helper — no split.** Googlebot-Image sends `image/webp` and gets WebP, which Google supports in structured data; `w=1200` meets the ≥1200px Article guidance; URLs are deterministic and crawlable. Two helpers would mean two behaviours and two chances to regress.

While touching these lines, drop the hardcoded `width: 1200, height: 630` on OG images whose real aspect ratio is arbitrary — it currently asserts something false.

**Verify — do step 1 on Preview before merging**, since Vercel serves `/_next/image` with its own infrastructure and I could only prove the behaviour from the bundled Node implementation:

```bash
curl -sI -H 'Accept: */*' -H 'User-Agent: facebookexternalhit/1.1' \
  'https://<preview>/_next/image?url=<encoded-supabase-url>&w=1200&q=75'
```

Expect `content-type: image/jpeg`. Repeat with a Chrome `Accept` and expect `image/webp`. **If the `*/*` case returns WebP, stop** and fall back to absolutised raw URLs for `og:image`, keeping the optimizer for JSON-LD only.

Then: Facebook Sharing Debugger + Twitter Card Validator on one listing, one guide, one blog post and `/`; Google Rich Results Test on a listing and a post; extend the "0 raw Supabase srcs" grep to `<meta>` and `ld+json` blocks.

**Known cost:** each `*/*` request creates a separate cache entry from the browser `image/webp` one (mimeType is part of the cache key, `image-optimizer.js:676-684`). Expect ~127 one-time extra transformations, held 31 days by `minimumCacheTTL`. Current usage is 7, so there is ample headroom — but read the live Vercel number before merging rather than trusting that estimate.

---

## Stage 4 — PostgREST "Unhealthy": investigate, ship no code

Database, Auth, Realtime, Storage and Edge Functions all report **Healthy**; only PostgREST is not. Logs show a single repeated message ~15×/24h at irregular 23–73 min intervals: `Warp server error: Thread killed by timeout manager`.

Supporting evidence from `pg_stat_statements`: `SELECT name FROM pg_timezone_names` (role `authenticator` — PostgREST's own role) at **99 calls**, mean 561 ms, **max 5,977 ms**, 118k rows; and the schema-introspection query at exactly **99 calls** too. PostgREST runs both once per schema-cache load, so that is ~99 reloads.

A plausible chain is: schema reload → slow introspection on a `t4g.nano` at 71% RAM → in-flight requests queue → Warp's timeout manager kills the thread → health probe fails.

**I am not calling that a root cause**, for three reasons:

1. The `pg_stat_statements` window is unknown — those counters run since the last reset, so "99 reloads" could span a day or three weeks.
2. Supabase's `pgrst_ddl_watch` event trigger fires a reload per **DDL statement**, not per migration file, so my five migrations plausibly account for 20–40 — but not 99, and reloads continued after the migration window.
3. The ~15 Warp errors and the 99 reloads don't correlate 1:1, and the 23–73 min spacing matches no schedule I can identify.

**Nothing in the application can trigger a reload** — the app runs no DDL at runtime. And **Stage 2 will not fix this**: ~336 homepage queries/day is a rounding error against 14,089 `pgbouncer.get_auth` calls. Claiming otherwise would be manufacturing a causal story.

Read-only actions, no migration, no code:

1. `select stats_reset from pg_stat_statements_info;` — anchors every rate claim above.
2. `select * from cron.job;` — rule out a scheduled job on that cadence.
3. Check `postgrest` logs for process **startup** lines, to distinguish restarts from in-place reloads. Highest-information next data point.
4. Ship Stages 1–3, wait a week, re-read. If still Unhealthy — which I expect — open a Supabase support ticket with the `pg_stat_statements` rows and the Warp excerpt. Support has instance-level visibility we don't.

**Do not upgrade off `t4g.nano` speculatively.** CPU 2%, disk 14%, 12/60 connections; only RAM (71%) is pressured and nothing links it to the timeouts. Upgrading costs money and destroys the signal. All user-facing services are Healthy and the site works — treat this as a monitoring anomaly until proven otherwise.

---

## Explicitly not doing

- **Raising the weather TTL to 6h** — superseded by Stage 2; would leave a permanent clock on `/` and make weather staler for no reason.
- **`opengraph-image` / `ImageResponse` generated cards** — replaces real photography with templated text on a visual travel directory (a product downgrade), inflates build time or adds per-crawl invocations, and doesn't address the actual egress. `scripts/generate-og-image.mjs` + `public/og-image.jpg` already covers the no-image fallback.
- **Adding AVIF back to `images.formats`** — doubles transformations for ~20% size, and would add a third cache-key variant per image.
- **Rewriting `20260708120000_tour_guides.sql`** to remove the policy — migrations are immutable history; record the drift in `supabase/README.md` per the `chat_logs` precedent.
- **The `middleware` → `proxy` deprecation** — still deferred by agreement. Worth doing before a Next major bump, since it becomes a hard removal.

---

## Sequencing

Stages 1, 2 and 3 are mutually independent and can ship in any order or together. Stage 4 is investigation only and blocks nothing. Suggested commits: one per stage, plus the migration-rename amend in Stage 1.
