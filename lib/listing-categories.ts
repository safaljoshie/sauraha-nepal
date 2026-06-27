/** Delimiter for multiple categories in business_listings.category (text column). */
export const LISTING_CATEGORY_DELIMITER = " | "

export function parseListingCategories(category: string | null | undefined): string[] {
  if (!category?.trim()) return []
  return category
    .split(LISTING_CATEGORY_DELIMITER)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function serializeListingCategories(categories: string[]): string {
  const unique = [...new Set(categories.map((c) => c.trim()).filter(Boolean))]
  return unique.join(LISTING_CATEGORY_DELIMITER)
}

export function getPrimaryListingCategory(category: string | null | undefined): string {
  return parseListingCategories(category)[0] ?? ""
}

export function listingHasCategory(
  category: string | null | undefined,
  name: string,
): boolean {
  const target = name.trim().toLowerCase()
  return parseListingCategories(category).some((c) => c.toLowerCase() === target)
}

export function normalizeListingCategoriesInput(
  categories: string[] | undefined,
  fallbackCategory?: string,
): string[] {
  if (categories?.length) {
    return parseListingCategories(serializeListingCategories(categories))
  }
  return parseListingCategories(fallbackCategory)
}
