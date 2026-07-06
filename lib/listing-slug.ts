import type { SupabaseClient } from "@supabase/supabase-js"

/** Lowercase slug from business name: spaces/special chars → hyphens, collapse repeats. */
export function slugifyBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function isListingUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

/** Unique slug for insert/update; appends -2, -3, … on collision. */
export async function generateUniqueListingSlug(
  supabase: SupabaseClient,
  businessName: string,
  excludeId?: string,
): Promise<string> {
  const base = slugifyBusinessName(businessName) || "listing"
  let candidate = base
  let suffix = 2

  while (true) {
    const { data, error } = await supabase
      .from("business_listings")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle()

    if (error) throw error
    if (!data || (excludeId && data.id === excludeId)) return candidate

    candidate = `${base}-${suffix}`
    suffix += 1
  }
}
