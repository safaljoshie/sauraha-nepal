const LISTING_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ListingStatus = "pending" | "approved" | "rejected"
export type ListingPlan = "basic" | "featured" | "premium"

export type BusinessListing = {
  id: string
  created_at: string
  business_name: string
  slug: string | null
  category: string
  description: string | null
  price_range: string | null
  opening_hours: string | null
  owner_name: string
  email: string
  phone: string | null
  whatsapp: string | null
  website: string | null
  facebook: string | null
  address: string | null
  google_maps_link: string | null
  photo_links: string | null
  plan: string
  status: string
  agreed_to_terms: boolean | null
  verified: boolean | null
  /** Resolved once by scripts/backfill-listing-coordinates.ts, not per render. */
  latitude: number | null
  longitude: number | null
}

/**
 * What list views actually need. Drops the full description and photo_links
 * blob (replaced by generated `description_preview` / `cover_photo_url`
 * columns) plus fields no card renders — owner_name, email, agreed_to_terms.
 */
export type BusinessListingSummary = Omit<
  BusinessListing,
  | "owner_name"
  | "email"
  | "agreed_to_terms"
  | "description"
  | "photo_links"
  | "facebook"
  | "status"
> & {
  description_preview: string | null
  cover_photo_url: string | null
}

export function formatSubmittedDate(iso: string) {
  const { date, time } = formatSubmittedDateParts(iso)
  return `${date}, ${time}`
}

export function formatSubmittedDateParts(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

export function planLabel(plan: string) {
  switch (plan) {
    case "featured":
      return "Featured (NPR 5,000/yr)"
    case "premium":
      return "Premium (NPR 12,000/yr)"
    default:
      return "Basic (Free)"
  }
}

export function isPaidPlan(plan: string) {
  return plan === "featured" || plan === "premium"
}

export function hasListingContactEmail(email: string | null | undefined) {
  const value = email?.trim() ?? ""
  return value.length > 0 && LISTING_EMAIL_RE.test(value)
}
