# Changelog

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
