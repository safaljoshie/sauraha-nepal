import type { NextConfig } from "next"
import { BLOG_SLUG_REDIRECTS } from "./lib/blog-slug-redirects"

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(BLOG_SLUG_REDIRECTS).map(([source, destination]) => ({
      source: `/blog/${source}`,
      destination: `/blog/${destination}`,
      permanent: true,
    }))
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
}

export default nextConfig
