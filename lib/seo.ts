import type { Metadata } from "next"
import type { BusinessListing } from "@/lib/business-listing"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { BlogPostRow } from "@/lib/blog-db"
import { SITE_URL } from "@/lib/blog-posts"
import { getCategoryDisplay, getCategoryGroupId, getListingImage } from "@/lib/listings-catalog"

export const DEFAULT_OG_IMAGE = "/og-image.jpg"

export const SITE_KEYWORDS = [
  "Sauraha Nepal",
  "Sauraha travel guide",
  "things to do in Sauraha",
  "Chitwan National Park hotels",
  "Sauraha hotels",
  "jungle safari Chitwan",
  "Sauraha restaurants",
  "Chitwan jeep safari",
  "Tharu cultural show Sauraha",
  "Sauraha to Chitwan National Park distance",
  "how far is Sauraha from Kathmandu",
  "Sauraha Nepal itinerary",
  "Chitwan National Park entry fee",
  "best time to visit Chitwan",
  "one horned rhino Chitwan",
  "Sauraha Nepal weather",
  "Rapti River Sauraha",
  "Sauraha tour guides",
] as const

const CATEGORY_PHRASE_BY_GROUP: Record<string, string> = {
  stay: "hotel near Chitwan National Park",
  eat: "restaurant in Sauraha",
  activities: "jungle safari & activity operator in Sauraha",
  transport: "transport service in Sauraha",
  shopping: "shop in Sauraha",
  guides: "licensed tour guide in Sauraha",
  info: "travel resource in Sauraha",
}

export const LISTINGS_CATEGORY_META: Record<string, { title: string; description: string }> = {
  stay: {
    title: "Hotels & Resorts in Sauraha Near Chitwan National Park",
    description:
      "Browse verified hotels, resorts and guesthouses in Sauraha. Compare prices, locations and reviews for the best places to stay near Chitwan National Park.",
  },
  eat: {
    title: "Restaurants in Sauraha Near Chitwan National Park",
    description:
      "Find riverside restaurants, local Nepali eateries and international dining in Sauraha. Compare menus, prices and reviews near Chitwan National Park.",
  },
  activities: {
    title: "Jungle Safari & Activities in Sauraha, Chitwan National Park",
    description:
      "Book jeep safaris, canoe rides, elephant bathing, bird watching tours and Tharu cultural shows in Sauraha near Chitwan National Park.",
  },
  transport: {
    title: "Transport Services in Sauraha & Chitwan",
    description:
      "Find taxis, buses, bike hire and local transport operators in Sauraha for getting around Chitwan National Park and nearby villages.",
  },
  shopping: {
    title: "Shopping in Sauraha, Chitwan",
    description:
      "Discover local shops, souvenirs and essentials in Sauraha village near Chitwan National Park.",
  },
  guides: {
    title: "Tour Guides in Sauraha, Chitwan National Park",
    description:
      "Hire licensed local tour guides in Sauraha for jungle walks, wildlife spotting, village visits and Chitwan National Park trips.",
  },
  info: {
    title: "Travel Information for Sauraha & Chitwan",
    description:
      "Practical travel information, park permits and local tips for visiting Sauraha and Chitwan National Park.",
  },
}

export function truncateMetaDescription(text: string, max = 160) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  const slice = cleaned.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(" ")
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`
}

export function truncateMetaTitle(text: string, max = 60) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= max) return cleaned
  const slice = cleaned.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(" ")
  return `${(lastSpace > 24 ? slice.slice(0, lastSpace) : slice).trim()}…`
}

export function getCategoryPhrase(category: string, catalog?: CategoryCatalog) {
  const groupId = getCategoryGroupId(category, catalog)
  return CATEGORY_PHRASE_BY_GROUP[groupId] ?? `${getCategoryDisplay(category, catalog).toLowerCase()} in Sauraha`
}

/** Natural proximity language from address or coarse coordinates — no invented distances. */
export function getListingProximityPhrase(
  address: string | null | undefined,
  lat?: number | null,
  lng?: number | null,
): string {
  const text = (address ?? "").toLowerCase()

  if (/\brapti\b/.test(text)) return "near the Rapti River"
  if (/\bnarayani\b/.test(text)) return "near the Narayani River"
  if (/\bbis[\s-]?hazari\b/.test(text)) return "near Bis Hazari Lake"
  if (/\btharu\b/.test(text) && /\b(museum|cultural|village)\b/.test(text)) {
    return "near the Tharu Cultural Museum area"
  }
  if (
    /\bcentral\b|\bbazaar\b|\bmain\s*(road|street|bazaar)\b|\bmarket\b|\bvillage\s*cent(re|er)\b/.test(
      text,
    )
  ) {
    return "in central Sauraha"
  }
  if (/\bpark\b|\bchitwan\s*national\b|\bjungle\b/.test(text)) return "near Chitwan National Park"

  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    if (lng < 84.485) return "near the Rapti River"
    if (lng >= 84.485 && lng <= 84.51 && lat >= 27.575 && lat <= 27.59) return "in central Sauraha"
  }

  return "near Chitwan National Park"
}

export function listingImageAlt(businessName: string, category: string, catalog?: CategoryCatalog) {
  const display = getCategoryDisplay(category, catalog)
  return `${businessName} — ${display} near Chitwan National Park, Sauraha`
}

export function blogCoverAlt(title: string) {
  return `${title} — Sauraha Nepal travel guide`
}

function absoluteImageUrl(image: string) {
  return image.startsWith("http") ? image : `${SITE_URL}${image}`
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords,
  titleAbsolute = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: "website" | "article"
  keywords?: string[]
  titleAbsolute?: boolean
}): Metadata {
  const url = `${SITE_URL}${path}`
  const ogImage = absoluteImageUrl(image)
  const safeDescription = truncateMetaDescription(description)
  const safeTitle = truncateMetaTitle(title)
  const ogTitle = titleAbsolute ? safeTitle : `${safeTitle} | Sauraha Nepal`

  return {
    title: titleAbsolute ? { absolute: safeTitle } : safeTitle,
    description: safeDescription,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: safeDescription,
      url,
      siteName: "Sauraha Nepal",
      locale: "en_US",
      type,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: safeDescription,
      images: [ogImage],
    },
  }
}

export function buildListingDetailMetadata(
  listing: BusinessListing,
  id: string,
  catalog?: CategoryCatalog,
  coords?: { lat: number; lng: number } | null,
): Metadata {
  const categoryPhrase = getCategoryPhrase(listing.category, catalog)
  const title = truncateMetaTitle(`${listing.business_name} — ${categoryPhrase} | Sauraha, Nepal`)
  const priceBit = listing.price_range?.trim() ? `${listing.price_range.trim()} ` : ""
  const proximity = getListingProximityPhrase(listing.address, coords?.lat, coords?.lng)
  const addressPart = listing.address?.trim() ? ` in ${listing.address.trim()}` : ""
  const snippet = listing.description?.trim()
    ? truncateMetaDescription(listing.description, 100).replace(/…$/, "")
    : ""
  const description = truncateMetaDescription(
    `${listing.business_name} is a ${priceBit}${categoryPhrase}${addressPart}, ${proximity}.${snippet ? ` ${snippet}` : ""} See photos, reviews and contact details.`,
  )
  const image = getListingImage(listing)
  const categoryLabel = getCategoryDisplay(listing.category, catalog)
  const keywords = [
    listing.business_name,
    `${categoryLabel} Sauraha`,
    `${categoryLabel} Chitwan National Park`,
    "Sauraha Nepal",
    "Chitwan travel guide",
    listing.address ?? undefined,
  ].filter((value): value is string => Boolean(value?.trim()))

  const url = `${SITE_URL}/listings/${id}`

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Sauraha Nepal",
      locale: "en_US",
      type: "website",
      images: [{ url: absoluteImageUrl(image), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl(image)],
    },
  }
}

export function buildListingsIndexMetadata(categorySlug?: string | null): Metadata {
  const category = categorySlug?.trim().toLowerCase()
  const meta = category && LISTINGS_CATEGORY_META[category] ? LISTINGS_CATEGORY_META[category] : {
    title: "Sauraha Hotels, Restaurants & Tours — Browse Verified Local Listings",
    description:
      "Browse hotels, restaurants, jungle safari operators and licensed guides in Sauraha, near Chitwan National Park. Filter by category and price, with real traveller reviews.",
  }

  const path = category ? `/listings?category=${encodeURIComponent(category)}` : "/listings"

  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path,
    titleAbsolute: true,
  })
}

export function buildBlogPostMetadata(post: BlogPostRow): Metadata {
  const title = truncateMetaTitle(post.meta_title?.trim() || post.title)
  const description = truncateMetaDescription(post.meta_description?.trim() || post.excerpt || "")
  const image = post.cover_image ?? DEFAULT_OG_IMAGE
  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "Sauraha Nepal",
      locale: "en_US",
      publishedTime: post.published_at ?? undefined,
      authors: [post.author?.trim() || "Sauraha Nepal"],
      images: [{ url: absoluteImageUrl(image), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl(image)],
    },
  }
}

export function articleJsonLd(post: BlogPostRow) {
  const image = post.cover_image ? absoluteImageUrl(post.cover_image) : absoluteImageUrl(DEFAULT_OG_IMAGE)
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    author: {
      "@type": "Organization",
      name: post.author?.trim() || "Sauraha Nepal",
    },
    datePublished: post.published_at ?? post.created_at,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }
}

export function listingJsonLd(
  listing: {
    id: string
    business_name: string
    description: string | null
    address: string | null
    phone: string | null
    email: string
    price_range?: string | null
    image?: string | null
    lat?: number
    lng?: number
    aggregateRating?: { ratingValue: number; reviewCount: number }
  },
) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name,
    description: listing.description ?? undefined,
    telephone: listing.phone ?? undefined,
    url: `${SITE_URL}/listings/${listing.id}`,
    priceRange: listing.price_range ?? undefined,
  }

  if (listing.image?.trim()) {
    schema.image = listing.image.startsWith("http")
      ? listing.image
      : `${SITE_URL}${listing.image.startsWith("/") ? listing.image : `/${listing.image}`}`
  }

  if (listing.address?.trim()) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: "Sauraha",
      addressRegion: "Chitwan",
      addressCountry: "NP",
    }
  }

  if (listing.lat != null && listing.lng != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    }
  }

  if (listing.aggregateRating && listing.aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.aggregateRating.ratingValue,
      reviewCount: listing.aggregateRating.reviewCount,
    }
  }

  return schema
}
