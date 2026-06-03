import type { MetadataRoute } from "next"
import { fetchPublishedBlogPosts } from "@/lib/blog-db"
import { SITE_URL } from "@/lib/blog-posts"
import { fetchApprovedListings } from "@/lib/listings-fetch"

/** Always generate on request so crawlers get fresh XML (avoids stale/failed static cache). */
export const dynamic = "force-dynamic"

function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${encodeURI(normalized)}`
}

function staticPages(now: Date): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: absoluteUrl("/listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: absoluteUrl("/list-your-business"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ]
}

function safeLastModified(iso: string | null | undefined, fallback: Date) {
  if (!iso) return fallback
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? fallback : date
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pages = staticPages(now)

  try {
    const [listings, blogPosts] = await Promise.all([
      fetchApprovedListings(),
      fetchPublishedBlogPosts(),
    ])

    const listingPages: MetadataRoute.Sitemap = listings
      .filter((listing) => listing.id?.trim())
      .map((listing) => ({
        url: absoluteUrl(`/listings/${listing.id}`),
        lastModified: safeLastModified(listing.created_at, now),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))

    const blogPages: MetadataRoute.Sitemap = blogPosts
      .filter((post) => post.slug?.trim() && isValidSlug(post.slug))
      .map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: safeLastModified(post.published_at ?? post.updated_at, now),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))

    return [...pages, ...blogPages, ...listingPages]
  } catch (error) {
    console.error("Sitemap: failed to fetch dynamic URLs, returning static pages only:", error)
    return pages
  }
}
