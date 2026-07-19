# Optimise sauraha-nepal for Vercel + Supabase free tiers

## Context

The production site is burning free-tier quota on both providers and is slow:

- **Vercel ISR: 3K write units vs 821 read units in 12h.** Pages that are effectively static are regenerating constantly — `/` 57 reads / 328 writes, `/list-your-business` 34/143, `/about` 21/78, `/privacy-policy` 16/40.
- **Supabase cached egress 3.65 / 5 GB (73%)** while total Storage is only 63 MB — i.e. the bucket is being re-read from scratch roughly 58 times over. Grace period ended 17 Jul 2026, so exceeding quota now returns 402s.
- **`/listings`: 12.77s DOMContentLoaded, 5.0 MB transferred, 124 requests.**

Four root causes, all confirmed by reading the code:

1. **`/listings` is fully dynamic, not ISR.** `app/(site)/listings/page.tsx:37` awaits `searchParams`, which opts the route out of prerendering. It is the only route in the entire `(site)` group that touches `searchParams`/`cookies`/`headers`. So the expensive work below runs **per visitor**, not per 60s.
2. **A blocking geocode cascade.** `app/(site)/listings/page.tsx:42` awaits `buildListingCoordinateMap()`, which loops unresolved listings **serially** with a hard-coded `await sleep(1100)` between up to 4 geocode attempts each (`lib/map-coordinates.ts:50-54, 88-91`). `resolveGoogleMapsUrl` (`lib/google-maps.ts:156-167`) is an uncached fetch with an 8s timeout. This is the 12.77s.
3. **The image optimizer is disabled for every Supabase photo.** `components/listings/ListingImage.tsx:21-26` and `components/guides/GuideAvatar.tsx:21-23` force `unoptimized` for any `.supabase.co` URL. Browsers download full-size 1920px WebP originals (88–350 kB) for ~350px cards, 64px gallery thumbnails, and 80px avatars. This directly defeats `next.config.ts`'s `minimumCacheTTL: 2_678_400`, whose own comment says it exists to "reduce repeat fetches from Supabase Storage via the image optimizer." It also contradicts `lib/image.ts:9`, where `isNextOptimizedImageSrc` returns `true` for Supabase. **This is the main egress driver.**
4. **`revalidate = 60` on the `(site)` layout cascades to every page.** The effective revalidate for a route is the *lowest* among layout and page, so `/privacy-policy` regenerates on a 60s floor. Every page also redeclares `revalidate = 60`.

### Two findings that gate the work

- **Approve / reject / delete / categories call `revalidatePath` zero times** (verified: `app/api/admin/listings/[id]/approve/route.ts`, `.../reject/route.ts`, `app/api/admin/delete-listing/route.ts`, `app/api/admin/categories/route.ts`). Time-based `revalidate = 60` is currently the *only* mechanism publishing a newly approved listing. **Shipping `revalidate = false` before fixing these means admin approvals silently never appear.** Stage 1a strictly gates Stage 1b.
- **Supabase MCP is connected to the right project** (verified): org `tgoeknpmazszwkqwyjvj`, project ref `lagoqhdobkyknefcflsx` ("safaljoshie's Project"), Postgres 17.6, `ap-northeast-1`. Migrations in Stages 3–4 will be applied via `mcp__supabase__apply_migration`, with a matching `.sql` file also committed to `supabase/` to keep the repo convention intact.
- **Live schema verified** via `list_tables`: `business_listings` has **84 rows**, `photo_links` is nullable `text` (newline-delimited URLs) and `description` is nullable `text` — so the `regexp_match` / `left()` generated columns in Stage 4 are valid as written. RLS is enabled on the table.

### Decisions taken

- Image formats: **WebP only** (drop AVIF) — halves transformation count to stay inside the Hobby ~5k/month image quota.
- Scope: **all five stages**, in dependency order.

---

## Stage 1 — Kill time-based ISR

Expected: ISR writes drop ~95%, to near-zero outside admin edits and deploys.

### 1a. Close the on-demand revalidation gaps FIRST (gates 1b)

New file `lib/listing-revalidate.ts`, mirroring the existing `lib/blog-revalidate.ts` pattern and reusing `getListingDetailPath` from `lib/listing-url.ts`:

```ts
export function revalidateListing(listing: { id: string; slug?: string | null }) {
  revalidatePath("/")
  revalidatePath("/listings")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/listings/${listing.id}`)
  revalidatePath(getListingDetailPath(listing))
}
```

Call it from `app/api/admin/listings/[id]/approve/route.ts`, `.../reject/route.ts`, and `app/api/admin/delete-listing/route.ts` — **after the DB write succeeds but before the Resend email block**, so a mail failure can't skip publication. Replace the existing partial calls in `app/api/admin/update-listing/route.ts:153`, `update-listing-photos/route.ts:40`, and `upload-listing-photos/route.ts:10` (they currently miss `/` and the sitemap).

Add `revalidatePath("/", "layout")` to `app/api/admin/categories/route.ts`, `app/api/admin/categories/[id]/route.ts`, and `app/api/admin/category-groups/route.ts` — the catalog feeds `Navbar` (`app/(site)/layout.tsx:18`) and `SiteFooter`, so layout-wide is genuinely correct here.

Narrow two over-broad purges: drop the now-redundant `revalidatePath("/contact")` in `app/api/admin/settings/route.ts:46`, and drop `revalidatePath("/", "layout")` in `app/api/admin/site/hero/route.ts:35` (hero media is only used by `/`).

Verify `app/api/admin/blog/route.ts`'s **create** path calls `lib/blog-revalidate.ts` — it has 3 revalidate references but confirm creation is covered, not just update.

### 1b. Remove time-based revalidation

Per Next 16 docs (`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`): `false` is the default and is semantically `Infinity`; the lowest value across layout and page wins. A layout with no export contributes `Infinity`, so the page's value wins — meaning the export must be removed from **both** the layout and each page.

Delete `export const revalidate = 60` from: `app/(site)/layout.tsx:7`, `app/(site)/page.tsx:26`, `about/page.tsx:17`, `contact/page.tsx:8`, `listings/page.tsx:10`, `listings/[id]/page.tsx:26`, `guides/page.tsx:22`, `guides/[id]/page.tsx:28`, `blog/[slug]/page.tsx:21`.

Delete all three lines from `app/(site)/blog/page.tsx:6-8` (`force-dynamic` + `revalidate = 0` + `force-no-store`) — today every visitor triggers a service-role Supabase query. While there, route its inline `createClient` with `SUPABASE_SERVICE_ROLE_KEY` (lines 19-22) through `fetchPublishedBlogPostsPreview` in `lib/blog-db.ts` so it uses the anon-first path.

Keep `app/sitemap.ts:9` at `revalidate = 86400` as a cheap once-a-day backstop.

### 1c. Make `/listings` prerenderable

Remove the `searchParams` prop from `app/(site)/listings/page.tsx` entirely. `ListingsExplorer` is already `"use client"` and already listens to `popstate` plus a custom nav event (lines 79-115), so it is most of the way there.

- Delete `ListingsPageProps`, the `await searchParams`, and the `initialSearch` / `initialCategory` / `initialViewMode` / `focusSearchOnMount` props (`components/listings/ListingsExplorer.tsx:33-38`).
- Inside `ListingsExplorer`, derive those four values from `useSearchParams()`, reusing `parseCategoryParam` from `lib/listings-catalog.ts`. Initialise state lazily (`useState(() => …)`) so first render matches.
- Wrap `<ListingsExplorer />` in `<Suspense>` (required for `useSearchParams` in a prerendered route); `app/(site)/listings/loading.tsx` already exists for the fallback.

`PageHeader`'s `listings.length` subtitle stays server-rendered and is unaffected.

**Verify:** `npm run build` — every `(site)` route should print `○ (Static)` / `● (SSG)`, none `ƒ (Dynamic)`, none with an ISR expiry. Then approve a test listing in admin and confirm it appears on `/` and `/listings` within seconds with no deploy.

---

## Stage 2 — Re-enable the image optimizer

The single biggest Supabase egress win. Expected: cached egress down 80–90%, since the optimizer fetches each original once per 31 days instead of once per pageview, and browsers receive ~350px WebP instead of 1920px originals.

### Why `unoptimized` is there (matters for risk)

`git log -S` shows commit `f48969f` enabled the optimizer for Supabase, then `9eb12f5` ("fix: photo upload showing wrong/placeholder image…") re-added the `.supabase.co → true` branch **in the same commit** that fixed the real bug (missing `key={displaySrc}` and `failed` state reset). `remotePatterns` and `qualities` were already correct at that point, so the likely culprits are:

1. **HEIC.** `ALLOWED_PHOTO_MIME` (`lib/list-business-photos.ts:20-26`) accepts `image/heic` and `image/heif` — **verified**. Vercel's optimizer cannot decode HEIC, so those hard-400 through the optimizer while working fine unoptimized. Leading hypothesis.
2. **The `%20` bucket name.** Bucket is `"Sauraha Nepal Listing uploads"` and `getStoragePublicUrl` (`lib/list-business-photos.ts:190`) does `encodeURIComponent(bucket)`. Should round-trip, but legacy rows stored with a raw space or `+` would 400.

### The change

In `components/listings/ListingImage.tsx` delete `shouldUseUnoptimized` and use `isNextOptimizedImageSrc` directly (it already returns `true` for Supabase, resolving the contradiction). Same in `components/guides/GuideAvatar.tsx:21-23`.

**Change the error path at the same time**, or a HEIC row degrades to a stock Unsplash rhino (`LISTING_IMAGE_FALLBACK`) — exactly the symptom `9eb12f5` was fixing. Make it three-state:

```ts
const [mode, setMode] = useState<"optimized" | "raw" | "fallback">("optimized")
// onError: optimized → raw (same src, unoptimized) → fallback (stock image)
```

This makes the rollout safe even if the HEIC/encoding analysis is wrong.

### Bound the transformation count (`next.config.ts`)

Next's `getWidths` returns the **full** `[...deviceSizes, ...imageSizes]` list (14 entries) whenever `sizes` has no `vw` unit — so a 64px thumbnail currently requests a 14-width srcset. Set:

- `formats: ["image/webp"]` — halves transformations; highest-leverage single line
- `deviceSizes: [640, 828, 1200, 1920]`
- `imageSizes: [64, 128, 256, 384]`
- `qualities: [75]` — **and update `DEFAULT_IMAGE_QUALITY` in `lib/image.ts:2` from 80 to 75**, or the optimizer 400s

Give `components/listings/ListingPhotoGallery.tsx:222` (`sizes="64px"`) and `components/guides/GuideAvatar.tsx:61` (`sizes="80px"`) explicit `width`/`height` instead of `fill` + `sizes`, so Next emits only a 1x/2x pair.

### Verify before deploying

```bash
npm run build && npm run start
curl -sI -H 'Accept: image/webp' \
  'http://localhost:3000/_next/image?url=<encoded-supabase-url>&w=640&q=75'
```

Expect `200`, `content-type: image/webp`, and `content-length` far below the 88–350 kB original. Test three real rows. Separately, query `photo_links` for rows containing a literal space, a `+`, or `.heic`/`.heif` — that is the failure set. If non-empty, re-upload those as JPEG via the existing `scripts/compress-existing-photos.ts` rather than keeping the blanket `unoptimized`.

---

## Stage 3 — Persist geocoded coordinates (schema change)

**Approach: store lat/lng on the row.** Rejected alternatives, briefly: `unstable_cache` fails catastrophically on a cold miss (76 listings × 4 queries × 1.1s sleep ≈ 5+ min, past the function timeout); `<Suspense>` doesn't help because prerendering waits for all boundaries to resolve; an API route just moves the same work. Next 16's `use cache` would require enabling `cacheComponents`, which **removes** `dynamic`/`revalidate`/`fetchCache` support app-wide and would invalidate Stage 1 — wrong tool, wrong time.

Decisive argument: a business's coordinates never change, and Nominatim's usage policy requires bulk geocoding to be done offline. The `sleep(1100)` is an acknowledgement of that policy sitting in a *serving* path, which is the actual violation. A one-off script is the compliant shape.

Applied via `mcp__supabase__apply_migration` against project `lagoqhdobkyknefcflsx`, with the same SQL committed as `supabase/business_listings_coordinates.sql` (matching the existing `business_listings_verified.sql` style):

```sql
alter table business_listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists geocoded_at timestamptz;
```

New file `scripts/backfill-listing-coordinates.ts` (run via `tsx`, like `scripts/compress-existing-photos.ts`; add a `backfill:coordinates` entry to `package.json`). It reuses `buildListingCoordinateMap` **verbatim** — that function is fine, only its call site is wrong — then writes the columns back. ~5 minutes offline for 76 listings.

Runtime changes:

- `lib/map-coordinates.ts` — add a **synchronous** `coordinateMapFromListings(listings)` reading the stored columns. Keep async `buildListingCoordinateMap` exported for the script only.
- `app/(site)/listings/page.tsx:42` and `components/home/HomeMapSectionLoader.tsx:31` — swap to the sync version, deleting the blocking path entirely.
- `app/(site)/listings/[id]/page.tsx:75` — replace the per-request `getMapCoordinates(mapsLink)` fetch with the stored columns, falling back to the pure `parseCoordinates`.
- `app/api/admin/update-listing/route.ts` — when `google_maps_link` changes, resolve and persist. Inline is fine here (single listing, admin-triggered). Give `resolveGoogleMapsUrl` (`lib/google-maps.ts:156-167`) `next: { revalidate: 86400 }` so it stops being the only uncached fetch in that file.

**Verify:** `select count(*) from business_listings where status='approved' and latitude is null` should be near zero. `/listings` DOMContentLoaded should drop from 12.77s to well under 1s, with zero `nominatim.openstreetmap.org` calls in Vercel function logs during normal browsing.

---

## Stage 4 — Shrink the query payload (same migration)

`lib/listings-fetch.ts:9-10` uses one wide `APPROVED_LISTING_SELECT` for **both** list and detail views, and `fetchApprovedListings()` is called from `app/(site)/page.tsx:63`, `app/(site)/listings/page.tsx:39`, `app/sitemap.ts:65`, and `lib/chat-listings-context.ts:8`. The bulk is full `description` and the whole `photo_links` blob (~20 URLs × ~150 chars), and it ships twice — once as HTML, once as the RSC payload for `ListingsExplorer`.

Add to the same `.sql` file (both expressions are IMMUTABLE, so generated-column-safe; generated columns beat a view here because a view drags in `security_invoker`/RLS work and PostgREST can't express arbitrary SQL in `.select()`):

```sql
alter table business_listings
  add column if not exists cover_photo_url text
    generated always as (nullif((regexp_match(coalesce(photo_links,''), '(\S+)'))[1], '')) stored,
  add column if not exists description_preview text
    generated always as (left(coalesce(description,''), 160)) stored;
```

Split `lib/listings-fetch.ts` into `LISTING_SUMMARY_SELECT` (id, created_at, business_name, slug, category, description_preview, price_range, opening_hours, phone, whatsapp, website, address, cover_photo_url, latitude, longitude, plan, verified) and `LISTING_DETAIL_SELECT` (current wide list + lat/lng). `fetchApprovedListings()` uses summary; `fetchApprovedListingByColumn` keeps detail. Expected ~4 kB/row → ~700 B/row.

The minimum column set was traced against `BusinessListingCard.tsx`, `ListingsExplorer.tsx`, and every helper in `lib/listings-catalog.ts` (`filterListings`/`matchesSearch`, `sortListingsForDisplay`, `matchesCategoryGroup`, `countByCategoryGroup`, `getListingImage`).

**Keep type churn low** — declare `BusinessListingSummary`, but widen the *helpers* rather than propagating the type through ~20 files:

```ts
export function matchesCategoryGroup(l: Pick<BusinessListing, "category">, …)
export function sortListingsForDisplay<T extends Pick<BusinessListing, "plan" | "created_at">>(l: T[]): T[]
```

Generic passthrough on the sorts preserves the caller's type, so `lib/homepage-data.ts` and the `components/home/*` tree need only prop-type swaps and the helper bodies don't change. `getListingImage` becomes `listing.cover_photo_url ?? DEFAULT_IMAGE`.

Two more over-fetches in the same pass:

- `app/sitemap.ts:65` calls `fetchPublishedBlogPosts()`, which is `select("*")` (`lib/blog-db.ts:56`) — it pulls **full markdown bodies** to emit a list of slugs. Add `fetchPublishedBlogSlugs()` selecting `slug, published_at, updated_at`. Likely the largest single per-call egress in the repo.
- `lib/chat-listings-context.ts:8` refetches all listings per chat request but uses only the first 20 rows and 100 chars each. Wrap in `unstable_cache` with `revalidate: 3600` — this *is* the right place for it, because a cold miss is one cheap query, not a 5-minute geocode.

---

## Stage 5 — Prefetch and cleanups

**Framing:** RSC prefetches of a *static* route are CDN-served and count as ISR **reads**, not writes — they were never the 3K-writes problem. They mattered mainly because `/listings` was dynamic, so each prefetch triggered a full render; Stage 1c already removes most of that.

- `components/listings/BusinessListingCard.tsx:52` (full-card overlay) and `components/listings/ListingCardActions.tsx:30` ("View Details") link to the **same href**. Add `prefetch={false}` to the `ListingCardActions` one only — zero UX change, halves prefetch traffic on `/listings` and `/`.
- **Do not** blanket-disable the overlay link. Per `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md:304`, `prefetch={false}` kills hover prefetch too, which is a real regression on a directory site where card-click is the primary action. If 15 prefetches/page still bothers you after measuring, use a small `"use client"` wrapper that sets `prefetch={false}` and calls `useRouter().prefetch(href)` on `onMouseEnter`/`onTouchStart`.
- `lib/list-business-photos.ts:156-188` — `ensureListingPhotosBucket()` issues `listBuckets` + `updateBucket` on **every** upload. Guard with a module-level `let bucketVerified = false`. Minor (admin-only), but two wasted round-trips per photo.
- `lib/listings-fetch.ts` and siblings use an anon→service-role fallback that doubles egress on any error. Leave the pattern, but add a module-level "already failed once" guard so a persistent RLS misconfiguration doesn't double every query for the life of the deployment.

---

## Sequencing

- **1a strictly gates 1b** — never ship `revalidate = false` before approve/reject/delete call `revalidatePath`.
- **1c is independent** of 1a/1b and can ship first for the fastest win.
- **2, 3, 4 are mutually independent.** Stage 3's lat/lng and Stage 4's generated columns go in **one** `.sql` file, so do those together.

## Verification summary

| Stage | Check |
|---|---|
| 1 | `npm run build` route table: all `(site)` routes Static/SSG, none Dynamic. Approve a test listing → appears on `/` and `/listings` without a deploy. After 12h, Vercel ISR shows 0 writes on `/about` and `/privacy-policy`. |
| 2 | `curl -sI` the `/_next/image` endpoint against 3 real Supabase URLs → 200 + `image/webp` + much smaller `content-length`. Audit `photo_links` for spaces / `+` / `.heic`. Vercel Image Optimization panel: transformations grow then plateau. |
| 3 | `select count(*) … where latitude is null` ≈ 0. `/listings` DOMContentLoaded < 1s. No Nominatim calls in function logs. |
| 4 | DevTools: `/listings` document response size drops sharply. Supabase egress graph trends down over the following days. |
| 5 | DevTools Network on `/listings`: `?_rsc=` request count roughly halves. |

## Migrations / scripts

| Item | Type | Stage |
|---|---|---|
| lat/lng/geocoded_at **+** `cover_photo_url`, `description_preview` | one migration via Supabase MCP (`apply_migration`), SQL also committed to `supabase/business_listings_coordinates.sql` | 3 + 4 |
| `scripts/backfill-listing-coordinates.ts` + `package.json` entry | one-off offline script | 3 |
| Audit `photo_links` for spaces / `+` / `.heic` | read-only query via `execute_sql` | 2 |

> Both column sets ship as **one** migration against project `lagoqhdobkyknefcflsx`. The generated columns are `stored`, so adding them rewrites the table — trivial at 84 rows.

## Plan file location

A copy of this plan is saved to `.claude/plans/free-tier-optimisation.md` in the project repo, so it is versioned alongside the code.
