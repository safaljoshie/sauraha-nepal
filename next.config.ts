import type { NextConfig } from "next"
import { BLOG_SLUG_REDIRECTS } from "./lib/blog-slug-redirects"

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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 31 days — reduces repeat fetches from Supabase Storage via the image optimizer
    minimumCacheTTL: 2_678_400,
    qualities: [75, 80, 90],
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
