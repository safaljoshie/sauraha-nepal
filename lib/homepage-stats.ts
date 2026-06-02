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
  console.log("[HomepageStats] fetchHomepageStats start")

  try {
    const supabase = getSupabaseAdmin()
    console.log("[HomepageStats] Supabase admin client created")

    const { count: rawCount, error: countError } = await supabase
      .from("business_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    console.log("[HomepageStats] COUNT approved businesses", {
      count: rawCount,
      error: countError?.message ?? null,
    })

    if (countError) {
      console.error("[HomepageStats] count query failed, using fallback", countError)
      return FALLBACK_STATS
    }

    let businessCount = rawCount ?? 0

    const { data: categoryRows, error: categoryError } = await supabase
      .from("business_listings")
      .select("category")
      .eq("status", "approved")

    console.log("[HomepageStats] category rows", {
      rowCount: categoryRows?.length ?? 0,
      error: categoryError?.message ?? null,
    })

    if (categoryError) {
      console.error("[HomepageStats] category query failed", categoryError)
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

      console.log("[HomepageStats] backup id rows when count=0", {
        length: idRows?.length ?? 0,
        error: idError?.message ?? null,
      })

      if (!idError && idRows && idRows.length > 0) {
        businessCount = idRows.length
      }
    }

    if (businessCount === 0 && categoryCount === 0) {
      console.warn("[HomepageStats] zero counts from DB — using fallback stats")
      return FALLBACK_STATS
    }

    const result = {
      businessCount,
      categoryCount,
      fromFallback: false,
    }
    console.log("[HomepageStats] final", result)
    return result
  } catch (error) {
    console.error("[HomepageStats] fetch failed, using fallback", error)
    return FALLBACK_STATS
  }
}
