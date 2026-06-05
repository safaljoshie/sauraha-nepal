import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

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

    const { count: rawCount, error: countError } = await supabase
      .from("business_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (countError) {
      console.error("[HomepageStats] count query failed:", countError)
      return FALLBACK_STATS
    }

    let businessCount = rawCount ?? 0

    const { data: categoryRows, error: categoryError } = await supabase
      .from("business_listings")
      .select("category")
      .eq("status", "approved")

    if (categoryError) {
      console.error("[HomepageStats] category query failed:", categoryError)
      return {
        businessCount: businessCount || FALLBACK_STATS.businessCount,
        categoryCount: FALLBACK_STATS.categoryCount,
        fromFallback: true,
      }
    }

    let categoryCount = countUniqueCategories(categoryRows ?? [])

    if (businessCount === 0) {
      const { data: idRows, error: idError } = await supabase
        .from("business_listings")
        .select("id")
        .eq("status", "approved")

      if (!idError && idRows && idRows.length > 0) {
        businessCount = idRows.length
      }
    }

    if (businessCount === 0 && categoryCount === 0) {
      const anon = getSupabasePublic()
      const { count: anonCount, error: anonCountError } = await anon
        .from("business_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")

      const { data: anonCats, error: anonCatError } = await anon
        .from("business_listings")
        .select("category")
        .eq("status", "approved")

      if (!anonCountError && (anonCount ?? 0) > 0) {
        businessCount = anonCount ?? 0
        categoryCount = countUniqueCategories(anonCats ?? [])
      }
    }

    let fromFallback = false
    if (businessCount === 0) {
      businessCount = FALLBACK_STATS.businessCount
      fromFallback = true
    }
    if (categoryCount === 0) {
      categoryCount = FALLBACK_STATS.categoryCount
      fromFallback = true
    }

    return {
      businessCount,
      categoryCount,
      fromFallback,
    }
  } catch (error) {
    console.error("[HomepageStats] fetch failed:", error)
    return FALLBACK_STATS
  }
}
