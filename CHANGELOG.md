# Changelog

## Admin blog editor & site settings

### Blog (CMS)

- Supabase `blog_posts` table with RLS for published posts
- Admin dashboard tab: list, publish/unpublish, delete, **New Post**
- Editor at `/admin/blog/new` and `/admin/blog/[id]` with `@uiw/react-md-editor` (live preview)
- API: `GET/POST /api/admin/blog`, `GET/PUT/PATCH/DELETE /api/admin/blog/[id]`
- Public `/blog` and `/blog/[slug]` from Supabase; `react-markdown` for content
- Removed static blog article pages; sitemap and homepage use DB posts

### Site settings

- Supabase `site_settings` for social URLs, WhatsApp number, contact email
- Admin **Site Settings** tab with save toast
- Footer shows Facebook, Instagram, Twitter/X, TikTok, YouTube only when URLs are set
- Contact page email prefers `site_settings.email`

### SQL to run

- `supabase/blog_posts.sql`
- `supabase/site_settings.sql`

---

## Critical site fixes (stats, nav, listings UX, map)

### Homepage stats (FIX 1)

- `fetchHomepageStats()` uses service-role counts (approved businesses + distinct categories)
- Fallback values when DB unreachable; warns when stats and public listing fetch disagree (RLS)

### Footer & navigation (FIX 3–4)

- Dynamic copyright year in footer
- Mobile hamburger menu: slide-in panel, backdrop, Escape, body scroll lock

### Listing cards & contact (FIX 6–9)

- “New” badge for listings created in the last 7 days
- `telUrl()` / `normalizeNepalPhoneDigits()` for consistent `tel:` links
- Extended opening-hours parser (`7am-10pm`, `Daily 8am-9pm`, etc.)
- `OpenNowBadge` on listing and featured cards

### Share & map (FIX 10–11)

- Share buttons: `Copied! ✓` and brand-colored actions
- Leaflet map view on `/listings` with grid/map toggle; pins from `google_maps_link` coordinates

### Performance (FIX 7)

- `ListingsGridErrorBoundary` around the listings grid
- `ListingImage` keeps lazy loading for non-priority images

---

## Site fixes, blog, SEO & listing enhancements

### Homepage (FIX 1, FIX 3)

- Hero stats: unique category count from approved listings; animation starts when stats are already in view
- Activities: extended category filters (`culture`, `walk`)

### WhatsApp (FIX 2)

- Centralized Nepal number normalization in `lib/whatsapp.ts`
- Updated listing cards, detail page, contact sidebar, and share links

### Blog (TASK 4)

- Blog index at `/blog`
- New article: Chitwan National Park entry fees & permits
- Shared `BlogArticleLayout` with breadcrumb, related articles, share bar
- Existing articles: “Back to blog” links

### Footer (TASK 5, TASK 9)

- Info links point to blog routes
- Facebook and Instagram icons in footer

### Analytics & discovery (TASK 6–8)

- Google Analytics via `@next/third-parties` (production + `NEXT_PUBLIC_GA_ID`)
- Dynamic `app/sitemap.ts` (static pages, blog, listings)
- `public/robots.txt`

### List your business (TASK 10)

- WEBP uploads; client `submissionId` for `pending/{id}/` storage paths
- Upload progress indicator
- Bucket: `Sauraha Nepal Listing uploads` (unchanged)

### Listing detail (TASK 11–13, 14–15)

- Share buttons (copy link, WhatsApp, Facebook)
- Google Maps embed or address fallback + directions
- Opening hours with Open/Closed badge (Nepal time)
- JSON-LD `LocalBusiness`, full OG/Twitter metadata, `revalidate = 3600`
- `ListingImage` with placeholder fallback on broken images

### Other

- `lib/seo.ts`, `lib/blog-posts.ts`, `supabase/rls-business-listings.sql`
- README env vars: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL`
