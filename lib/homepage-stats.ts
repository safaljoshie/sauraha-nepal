import { getSupabaseAdmin } from "@/lib/supabase"

export type HomepageStats = {
  businessCount: number
  categoryCount: number
  fromFallback: boolean
}

const FALLBACK_STATS: HomepageStats = {
  businessCount: 4,
  categoryCount: 3,
  fromFallback: true,
}

function countUniqueCategories(rows: { category: string | null }[]) {
  const seen = new Set<string>()
  for (const row of rows) {
    const category = row.category?.trim()
    if (category) seen.add(category.toLowerCase())
  }
  return seen.size
}

/** Reliable homepage hero counts via service role (server-only). */
export async function fetchHomepageStats(): Promise<HomepageStats> {
  try {
    const supabase = getSupabaseAdmin()

    const { count: businessCount, error: countError } = await supabase
      .from("business_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (countError) {
      console.error("Homepage stats count error:", countError)
      return FALLBACK_STATS
    }

    const { data: categoryRows, error: categoryError } = await supabase
      .from("business_listings")
      .select("category")
      .eq("status", "approved")

    if (categoryError) {
      console.error("Homepage stats categories error:", categoryError)
      return {
        businessCount: businessCount ?? FALLBACK_STATS.businessCount,
        categoryCount: FALLBACK_STATS.categoryCount,
        fromFallback: true,
      }
    }

    return {
      businessCount: businessCount ?? 0,
      categoryCount: countUniqueCategories(categoryRows ?? []),
      fromFallback: false,
    }
  } catch (error) {
    console.error("Homepage stats fetch failed:", error)
    return FALLBACK_STATS
  }
}
