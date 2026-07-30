import { cache } from "react"
import { isListingUuid } from "@/lib/listing-slug"
import { getSupabaseAdmin } from "@/lib/supabase"
import {
  createSupabaseServerClient,
  getCurrentUser,
} from "@/lib/supabase/auth-server"

export type FavouriteTargetType = "listing" | "guide"

export type FavouriteRow = {
  id: string
  created_at: string
  user_id: string
  target_type: FavouriteTargetType
  target_id: string
}

export type FavouriteListItem = {
  id: string
  created_at: string
  target_type: FavouriteTargetType
  target_id: string
  title: string
  href: string
  imageUrl: string | null
  subtitle: string | null
}

export function isFavouriteTargetType(value: unknown): value is FavouriteTargetType {
  return value === "listing" || value === "guide"
}

/** Set of favourited target IDs for the signed-in user (empty if signed out). */
export const fetchFavouritedIds = cache(
  async (targetType: FavouriteTargetType): Promise<Set<string>> => {
    const user = await getCurrentUser()
    if (!user) return new Set()

    try {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from("favourites")
        .select("target_id")
        .eq("user_id", user.id)
        .eq("target_type", targetType)

      if (error || !data) {
        // Table may not exist yet before migration is applied.
        console.error("fetchFavouritedIds:", error?.message)
        return new Set()
      }

      return new Set(
        data
          .map((row) => (typeof row.target_id === "string" ? row.target_id : ""))
          .filter(Boolean),
      )
    } catch (err) {
      console.error("fetchFavouritedIds:", err)
      return new Set()
    }
  },
)

export async function isTargetFavourited(
  targetType: FavouriteTargetType,
  targetId: string,
): Promise<boolean> {
  const ids = await fetchFavouritedIds(targetType)
  return ids.has(targetId)
}

async function assertApprovedTarget(
  targetType: FavouriteTargetType,
  targetId: string,
): Promise<boolean> {
  if (!isListingUuid(targetId)) return false

  const admin = getSupabaseAdmin()
  if (targetType === "listing") {
    const { data } = await admin
      .from("business_listings")
      .select("id")
      .eq("id", targetId)
      .eq("status", "approved")
      .maybeSingle()
    return Boolean(data?.id)
  }

  const { data } = await admin
    .from("tour_guides")
    .select("id")
    .eq("id", targetId)
    .eq("status", "approved")
    .maybeSingle()
  return Boolean(data?.id)
}

/**
 * Toggle a favourite for the authenticated user.
 * Returns the new favourited state, or null if unauthorized / invalid.
 */
export async function toggleFavourite(
  userId: string,
  targetType: FavouriteTargetType,
  targetId: string,
): Promise<{ favourited: boolean } | { error: string; status: number }> {
  if (!isListingUuid(targetId)) {
    return { error: "Invalid target.", status: 400 }
  }

  const exists = await assertApprovedTarget(targetType, targetId)
  if (!exists) {
    return { error: "That listing or guide was not found.", status: 404 }
  }

  const admin = getSupabaseAdmin()
  const { data: existing, error: lookupError } = await admin
    .from("favourites")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle()

  if (lookupError) {
    console.error("toggleFavourite lookup:", lookupError)
    return { error: "Could not update favourites.", status: 500 }
  }

  if (existing?.id) {
    const { error: deleteError } = await admin.from("favourites").delete().eq("id", existing.id)
    if (deleteError) {
      console.error("toggleFavourite delete:", deleteError)
      return { error: "Could not update favourites.", status: 500 }
    }
    return { favourited: false }
  }

  const { error: insertError } = await admin.from("favourites").insert({
    user_id: userId,
    target_type: targetType,
    target_id: targetId,
  })

  if (insertError) {
    console.error("toggleFavourite insert:", insertError)
    return { error: "Could not update favourites.", status: 500 }
  }

  return { favourited: true }
}

/** Favourites for the account page, with display fields joined from listings/guides. */
export async function fetchMyFavourites(userId: string): Promise<FavouriteListItem[]> {
  const admin = getSupabaseAdmin()
  const { data: rows, error } = await admin
    .from("favourites")
    .select("id, created_at, target_type, target_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !rows) {
    console.error("fetchMyFavourites:", error?.message)
    return []
  }

  const listingIds = rows
    .filter((r) => r.target_type === "listing")
    .map((r) => r.target_id as string)
  const guideIds = rows
    .filter((r) => r.target_type === "guide")
    .map((r) => r.target_id as string)

  const [listingsRes, guidesRes] = await Promise.all([
    listingIds.length
      ? admin
          .from("business_listings")
          .select("id, business_name, slug, cover_photo_url, category, status")
          .in("id", listingIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    guideIds.length
      ? admin
          .from("tour_guides")
          .select("id, full_name, slug, photo_url, location, status")
          .in("id", guideIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ])

  const listingsById = new Map(
    (listingsRes.data ?? []).map((row) => [String(row.id), row as Record<string, unknown>]),
  )
  const guidesById = new Map(
    (guidesRes.data ?? []).map((row) => [String(row.id), row as Record<string, unknown>]),
  )

  const items: FavouriteListItem[] = []
  for (const row of rows) {
    const targetType = row.target_type as FavouriteTargetType
    const targetId = String(row.target_id)

    if (targetType === "listing") {
      const listing = listingsById.get(targetId)
      if (!listing || listing.status !== "approved") continue
      const slug = typeof listing.slug === "string" ? listing.slug.trim() : ""
      items.push({
        id: String(row.id),
        created_at: String(row.created_at),
        target_type: "listing",
        target_id: targetId,
        title: String(listing.business_name ?? "Listing"),
        href: `/listings/${slug || targetId}`,
        imageUrl:
          typeof listing.cover_photo_url === "string" ? listing.cover_photo_url : null,
        subtitle: typeof listing.category === "string" ? listing.category : null,
      })
      continue
    }

    const guide = guidesById.get(targetId)
    if (!guide || guide.status !== "approved") continue
    const slug = typeof guide.slug === "string" ? guide.slug.trim() : ""
    items.push({
      id: String(row.id),
      created_at: String(row.created_at),
      target_type: "guide",
      target_id: targetId,
      title: String(guide.full_name ?? "Guide"),
      href: `/guides/${slug || targetId}`,
      imageUrl: typeof guide.photo_url === "string" ? guide.photo_url : null,
      subtitle: typeof guide.location === "string" ? guide.location : null,
    })
  }

  return items
}
