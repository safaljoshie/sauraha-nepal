import type { MetadataRoute } from "next"
import { fetchPublishedBlogPosts } from "@/lib/blog-db"
import { fetchApprovedListings } from "@/lib/listings-fetch"

export const revalidate = 3600

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.saurahanepal.com"

function staticPages(now: Date): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${BASE_URL}/list-your-business`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ]
}

function safeLastModified(iso: string | null | undefined, fallback: Date) {
  if (!iso) return fallback
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? fallback : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pages = staticPages(now)

  try {
    const [listings, blogPosts] = await Promise.all([
      fetchApprovedListings(),
      fetchPublishedBlogPosts(),
    ])
    const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${BASE_URL}/listings/${listing.id}`,
      lastModified: safeLastModified(listing.created_at, now),
      changeFrequency: "weekly",
      priority: 0.7,
    }))
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: safeLastModified(post.published_at ?? post.updated_at, now),
      changeFrequency: "monthly",
      priority: 0.7,
    }))
    return [...pages, ...blogPages, ...listingPages]
  } catch (error) {
    console.error("Sitemap: failed to fetch listings, returning static URLs only:", error)
    return pages
  }
}
