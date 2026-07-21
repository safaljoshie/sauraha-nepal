import type { NextConfig } from "next"
import { BLOG_SLUG_REDIRECTS } from "./lib/blog-slug-redirects"

// UUID → slug redirects for /listings/:id are handled at request time in
// app/(site)/listings/[id]/page.tsx via permanentRedirect (301).

const nextConfig: NextConfig = {
  async redirects() {
    const blogRedirects = Object.entries(BLOG_SLUG_REDIRECTS).map(([source, destination]) => ({
      source: `/blog/${source}`,
      destination: `/blog/${destination}`,
      permanent: true,
    }))
    return [
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
      ...blogRedirects,
    ]
  },
  images: {
    // WebP only. Adding AVIF doubles the transformation count for ~20% file
    // size, and Vercel's Hobby plan meters transformations — not worth it for a
    // photo-heavy directory.
    formats: ["image/webp"],
    // Deliberately short lists: every extra width/quality is another billable
    // transformation per source image.
    //
    // LOAD-BEARING: `1200` here and `75` in qualities below are used by
    // socialImageUrl() in lib/image.ts to build og:image / twitter:image /
    // JSON-LD URLs. Removing either makes the optimizer 400 and breaks every
    // social preview on the site at once, with no local signal.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    // 31 days — reduces repeat fetches from Supabase Storage via the image optimizer
    minimumCacheTTL: 2_678_400,
    qualities: [75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
