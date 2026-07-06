import type { BusinessListing } from "@/lib/business-listing"
import { SITE_URL } from "@/lib/blog-posts"

export function getListingDetailPath(
  listing: Pick<BusinessListing, "id" | "slug">,
): string {
  const slug = listing.slug?.trim()
  return `/listings/${slug || listing.id}`
}

export function getListingDetailUrl(
  listing: Pick<BusinessListing, "id" | "slug">,
): string {
  return `${SITE_URL}${getListingDetailPath(listing)}`
}
