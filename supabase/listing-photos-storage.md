# Listing photo uploads (Supabase Storage)

Bucket name (as configured in Supabase): **Sauraha Nepal Listing uploads**

Set in Vercel and `.env.local`:

```
SUPABASE_LISTING_PHOTOS_BUCKET=Sauraha Nepal Listing uploads
```

The bucket should allow **public read** so approved listings can display images via `photo_links` URLs.

Uploads use the **service role** from `POST /api/list-business/upload-photos` (server only).

If uploads fail with policy errors, ensure the service role can write to this bucket, or add a storage policy for authenticated/service uploads.
