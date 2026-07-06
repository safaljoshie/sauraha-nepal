import type { BusinessListing } from "@/lib/business-listing"
import { isListingUuid } from "@/lib/listing-slug"
import { sortListingsForDisplay } from "@/lib/listings-catalog"
import { getSupabaseAdmin } from "@/lib/supabase"
import { getSupabasePublic } from "@/lib/supabase"
import { cache } from "react"

/** Public directory fields — slug is required for human-readable listing URLs. */
const APPROVED_LISTING_SELECT =
  "id, created_at, business_name, slug, category, description, price_range, opening_hours, owner_name, email, phone, whatsapp, website, facebook, address, google_maps_link, photo_links, plan, status, agreed_to_terms, verified"

async function countApprovedWithClient(
  client: ReturnType<typeof getSupabasePublic>,
): Promise<number> {
  const { count, error } = await client
    .from("business_listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
  if (error) throw error
  return count ?? 0
}

/** Approved listing count for homepage stats (server-only head query). */
export const fetchApprovedListingsCount = cache(async (): Promise<number> => {
  try {
    return await countApprovedWithClient(getSupabaseAdmin())
  } catch (adminError) {
    console.error("Approved listings count (admin):", adminError)
  }

  try {
    return await countApprovedWithClient(getSupabasePublic())
  } catch (publicError) {
    console.error("Approved listings count (public):", publicError)
  }

  return 0
})

async function queryApprovedListings() {
  const supabase = getSupabasePublic()
  return supabase
    .from("business_listings")
    .select(APPROVED_LISTING_SELECT)
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
        .select(APPROVED_LISTING_SELECT)
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

async function fetchApprovedListingWithClient(
  client: ReturnType<typeof getSupabasePublic>,
  column: "id" | "slug",
  value: string,
): Promise<BusinessListing | null> {
  const { data, error } = await client
    .from("business_listings")
    .select(APPROVED_LISTING_SELECT)
    .eq(column, value)
    .eq("status", "approved")
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as BusinessListing | null
}

async function fetchApprovedListingByColumn(
  column: "id" | "slug",
  value: string,
): Promise<BusinessListing | null> {
  try {
    const result = await fetchApprovedListingWithClient(getSupabasePublic(), column, value)
    if (result) return result
  } catch {
    // fall through to admin
  }

  try {
    return await fetchApprovedListingWithClient(getSupabaseAdmin(), column, value)
  } catch {
    return null
  }
}

export async function fetchApprovedListingById(
  id: string,
): Promise<BusinessListing | null> {
  return fetchApprovedListingByColumn("id", id)
}

export async function fetchApprovedListingBySlug(
  slug: string,
): Promise<BusinessListing | null> {
  return fetchApprovedListingByColumn("slug", slug)
}

/** Resolve an approved listing by slug first, then UUID id for backward compatibility. */
export async function fetchApprovedListingBySlugOrId(
  slugOrId: string,
): Promise<BusinessListing | null> {
  const trimmed = slugOrId.trim()
  if (!trimmed) return null

  if (!isListingUuid(trimmed)) {
    const bySlug = await fetchApprovedListingBySlug(trimmed)
    if (bySlug) return bySlug
  }

  return fetchApprovedListingById(trimmed)
}
