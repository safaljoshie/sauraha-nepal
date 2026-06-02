import type { BusinessListing } from "@/lib/business-listing"
import { sortListingsForDisplay } from "@/lib/listings-catalog"
import { getSupabaseAdmin } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

async function queryApprovedListings() {
  return supabase
    .from("business_listings")
    .select("*")
    .eq("status", "approved")
}

/** Fetch approved listings for public directory (server-side). */
export async function fetchApprovedListings(): Promise<BusinessListing[]> {
  let { data, error } = await queryApprovedListings()

  if (error) {
    console.error("Supabase anon fetch error, trying service role:", error.message)
    try {
      const admin = getSupabaseAdmin()
      const result = await admin
        .from("business_listings")
        .select("*")
        .eq("status", "approved")
      data = result.data
      error = result.error
    } catch (adminErr) {
      console.error("Supabase admin fetch failed:", adminErr)
      return []
    }
  }

  if (error || !data) {
    console.error("Failed to fetch listings:", error)
    return []
  }

  return sortListingsForDisplay(data as BusinessListing[])
}

export async function fetchApprovedListingById(
  id: string,
): Promise<BusinessListing | null> {
  let { data, error } = await supabase
    .from("business_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle()

  if (error || !data) {
    try {
      const admin = getSupabaseAdmin()
      const result = await admin
        .from("business_listings")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle()
      data = result.data
      error = result.error
    } catch {
      return null
    }
  }

  if (error || !data) return null
  return data as BusinessListing
}
