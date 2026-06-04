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
    qualities: [75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [256, 384, 512, 640, 750, 828, 1080],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
}

export default nextConfig
