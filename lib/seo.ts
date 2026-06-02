import type { Metadata } from "next"
import { SITE_URL } from "@/lib/blog-posts"

export function pageMetadata({
  title,
  description,
  path,
  image = "/images/home-hero.png",
  type = "website",
}: {
  title: string
  description: string
  path: string
  image?: string
  type?: "website" | "article"
}): Metadata {
  const url = `${SITE_URL}${path}`
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} – Sauraha Nepal`,
      description,
      url,
      siteName: "Sauraha Nepal",
      type,
      images: [{ url: absoluteImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} – Sauraha Nepal`,
      description,
      images: [absoluteImage],
    },
  }
}

export function listingJsonLd(listing: {
  id: string
  business_name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name,
    description: listing.description ?? undefined,
    address: listing.address ?? undefined,
    telephone: listing.phone ?? undefined,
    url: `${SITE_URL}/listings/${listing.id}`,
  }
}
