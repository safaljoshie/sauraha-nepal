import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export type BusinessReview = {
  id: string
  created_at: string
  business_id: string
  reviewer_name: string
  reviewer_email: string | null
  reviewer_country: string | null
  rating: number
  comment: string
  status: string
  visit_date: string | null
}

export type BusinessReviewWithListing = BusinessReview & {
  business?: { id: string; business_name: string } | null
}

/** Approved reviews for a business detail page (admin-first, anon fallback). */
export async function fetchApprovedBusinessReviews(businessId: string): Promise<BusinessReview[]> {
  const trimmed = businessId.trim()
  if (!trimmed) return []

  const fetchReviews = async (client: SupabaseClient) => {
    const { data, error } = await client
      .from("business_reviews")
      .select("*")
      .eq("business_id", trimmed)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
    if (error || !data) return []
    return data as BusinessReview[]
  }

  try {
    const admin = getSupabaseAdmin()
    const reviews = await fetchReviews(admin)
    if (reviews.length > 0) return reviews
  } catch {
    // fall through to anon
  }

  try {
    return await fetchReviews(getSupabasePublic())
  } catch {
    return []
  }
}

/** All business reviews for the admin moderation queue. */
export async function fetchAllBusinessReviewsAdmin(): Promise<BusinessReviewWithListing[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("business_reviews")
    .select("*, business_listings(id, business_name)")
    .order("created_at", { ascending: false })
  if (error || !data) return []

  return data.map((row) => {
    const listing = (row as Record<string, unknown>).business_listings as
      | { id: string; business_name: string }
      | null
    const { business_listings: _omit, ...review } = row as Record<string, unknown>
    return { ...(review as unknown as BusinessReview), business: listing }
  })
}
