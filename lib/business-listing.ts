export type ListingStatus = "pending" | "approved" | "rejected"
export type ListingPlan = "basic" | "featured" | "premium"

export type BusinessListing = {
  id: string
  created_at: string
  business_name: string
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
}

export function formatSubmittedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
