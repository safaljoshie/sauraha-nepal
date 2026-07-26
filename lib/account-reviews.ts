import { getSupabaseAdmin, hasSupabaseAdminCredentials } from "@/lib/supabase"

export type MyReview = {
  id: string
  kind: "guide" | "business"
  subjectName: string
  rating: number
  comment: string
  status: string
  createdAt: string | null
}

function embeddedName(value: unknown, key: string): string {
  if (!value) return "—"
  const row = Array.isArray(value) ? value[0] : value
  if (row && typeof row === "object" && key in row) {
    const name = (row as Record<string, unknown>)[key]
    if (typeof name === "string") return name
  }
  return "—"
}

/**
 * The signed-in user's own reviews across guides and businesses, including
 * pending ones (RLS only exposes approved rows publicly, so this uses the
 * service-role client, scoped strictly to the given user_id).
 */
export async function fetchMyReviews(userId: string): Promise<MyReview[]> {
  if (!hasSupabaseAdminCredentials()) return []
  const admin = getSupabaseAdmin()

  const [guides, businesses] = await Promise.all([
    admin
      .from("guide_reviews")
      .select("id, rating, comment, status, created_at, tour_guides(full_name)")
      .eq("user_id", userId)
      .neq("status", "removed")
      .order("created_at", { ascending: false }),
    admin
      .from("business_reviews")
      .select("id, rating, comment, status, created_at, business_listings(business_name)")
      .eq("user_id", userId)
      .neq("status", "removed")
      .order("created_at", { ascending: false }),
  ])

  const guideReviews: MyReview[] = (guides.data ?? []).map((r) => ({
    id: r.id as string,
    kind: "guide",
    subjectName: embeddedName((r as Record<string, unknown>).tour_guides, "full_name"),
    rating: r.rating as number,
    comment: r.comment as string,
    status: r.status as string,
    createdAt: (r.created_at as string) ?? null,
  }))

  const businessReviews: MyReview[] = (businesses.data ?? []).map((r) => ({
    id: r.id as string,
    kind: "business",
    subjectName: embeddedName((r as Record<string, unknown>).business_listings, "business_name"),
    rating: r.rating as number,
    comment: r.comment as string,
    status: r.status as string,
    createdAt: (r.created_at as string) ?? null,
  }))

  return [...guideReviews, ...businessReviews].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  )
}
