import type { MetadataRoute } from "next"
import { fetchPublishedBlogPosts } from "@/lib/blog-db"
import { SEO_PRIORITY_BLOG_SLUGS } from "@/lib/blog-related-links"
import { SITE_URL } from "@/lib/blog-posts"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { fetchApprovedGuides, buildGuideProfilePath } from "@/lib/tour-guides"
import { getListingDetailPath } from "@/lib/listing-url"

export const revalidate = 3600

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
    {
      url: absoluteUrl("/guides"),
      lastModified: now,
      changeFrequency: "weekly",
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
    const [listings, blogPosts, guides] = await Promise.all([
      fetchApprovedListings(),
      fetchPublishedBlogPosts(),
      fetchApprovedGuides(),
    ])

    const listingPages: MetadataRoute.Sitemap = listings
      .filter((listing) => listing.id?.trim())
      .map((listing) => ({
        url: absoluteUrl(getListingDetailPath(listing)),
        lastModified: safeLastModified(listing.created_at, now),
        changeFrequency: "weekly" as const,
        priority: listing.plan === "featured" || listing.plan === "premium" ? 0.8 : 0.7,
      }))

    const blogPages: MetadataRoute.Sitemap = blogPosts
      .filter((post) => post.slug?.trim() && isValidSlug(post.slug))
      .map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: safeLastModified(post.published_at ?? post.updated_at, now),
        changeFrequency: "monthly" as const,
        priority: SEO_PRIORITY_BLOG_SLUGS.has(post.slug) ? 0.8 : 0.7,
      }))

    const guidePages: MetadataRoute.Sitemap = guides
      .filter((guide) => guide.id?.trim())
      .map((guide) => ({
        url: absoluteUrl(buildGuideProfilePath(guide)),
        lastModified: safeLastModified(guide.updated_at ?? guide.created_at, now),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))

    return [...pages, ...blogPages, ...listingPages, ...guidePages]
  } catch (error) {
    console.error("Sitemap: failed to fetch dynamic URLs, returning static pages only:", error)
    return pages
  }
}
