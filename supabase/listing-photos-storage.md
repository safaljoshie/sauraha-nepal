# Listing photo uploads (Supabase Storage)

Bucket name (as configured in Supabase): **Sauraha Nepal Listing uploads**

Set in Vercel and `.env.local`:

```
SUPABASE_LISTING_PHOTOS_BUCKET=Sauraha Nepal Listing uploads
```

The bucket should allow **public read** so approved listings can display images via `photo_links` URLs.

Uploads use the **service role** from `POST /api/list-business/upload-photos` (server only).

If uploads fail with policy errors, ensure the service role can write to this bucket, or add a storage policy for authenticated/service uploads.

## Homepage hero video

Hero videos (up to **50 MB**, MP4/WEBM) use the same bucket. The admin upload flow tries to set:

- **Max file size:** 50 MB (`52428800` bytes)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`

If a ~15 MB MP4 still fails, open **Supabase → Storage → Sauraha Nepal Listing uploads → Settings** and confirm those limits manually (the bucket may have been created with a 5 MB image-only cap).
