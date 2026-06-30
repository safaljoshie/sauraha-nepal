import type { BusinessListing } from "@/lib/business-listing"
import { formatSubmittedDate } from "@/lib/business-listing"
import {
  DEFAULT_CATEGORY_CATALOG,
  type BuiltCategoryGroup,
  type CategoryCatalog,
  type CategoryGroupId,
} from "@/lib/category-catalog"
import {
  parseListingCategories,
} from "@/lib/listing-categories"

export type { CategoryGroupId } from "@/lib/category-catalog"

export type PlanFilterId = "all" | "basic" | "featured" | "premium"

export type SortOptionId = "newest" | "az" | "plan"

export const PAGE_SIZE = 15

const PLAN_ORDER: Record<string, number> = {
  premium: 0,
  featured: 1,
  basic: 2,
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"

function resolveGroups(catalog?: CategoryCatalog): BuiltCategoryGroup[] {
  return catalog?.builtGroups ?? DEFAULT_CATEGORY_CATALOG.builtGroups
}

export function getCategoryGroupId(
  category: string,
  catalog?: CategoryCatalog,
): CategoryGroupId {
  const groups = resolveGroups(catalog)
  const names = parseListingCategories(category)
  if (names.length === 0) return "info"
  for (const name of names) {
    const group = groups.find(
      (g) => g.id !== "all" && g.id !== "info" && g.matchers.includes(name),
    )
    if (group) return group.id
  }
  return "info"
}

export function getCategoryDisplay(category: string, catalog?: CategoryCatalog) {
  const names = parseListingCategories(category)
  if (names.length === 0) return "Other"
  if (names.length === 1) {
    const groups = resolveGroups(catalog)
    const group = groups.find(
      (g) => g.id !== "all" && g.id !== "info" && g.matchers.includes(names[0]),
    )
    return group?.label ?? names[0]
  }
  return names.join(" · ")
}

export function sortListingsForDisplay(listings: BusinessListing[]) {
  return [...listings].sort((a, b) => {
    const planDiff = (PLAN_ORDER[a.plan] ?? 9) - (PLAN_ORDER[b.plan] ?? 9)
    if (planDiff !== 0) return planDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function sortListingsByOption(
  listings: BusinessListing[],
  sort: SortOptionId,
) {
  const copy = [...listings]
  if (sort === "az") {
    return copy.sort((a, b) =>
      a.business_name.localeCompare(b.business_name, undefined, {
        sensitivity: "base",
      }),
    )
  }
  if (sort === "plan") {
    return sortListingsForDisplay(copy)
  }
  return copy.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function matchesCategoryGroup(
  listing: BusinessListing,
  groupId: CategoryGroupId,
  catalog?: CategoryCatalog,
) {
  if (groupId === "all") return true
  const groups = resolveGroups(catalog)
  const group = groups.find((g) => g.id === groupId)
  if (!group) return false
  const names = parseListingCategories(listing.category)
  if (groupId === "info") {
    if (names.length === 0) return true
    return !names.some((name) =>
      groups.some(
        (g) => g.id !== "all" && g.id !== "info" && g.matchers.includes(name),
      ),
    )
  }
  return names.some((name) => group.matchers.includes(name))
}

export function matchesPlanFilter(listing: BusinessListing, plan: PlanFilterId) {
  if (plan === "all") return true
  return listing.plan === plan
}

export type HeroSearchListing = Pick<
  BusinessListing,
  "id" | "business_name" | "category" | "address" | "description"
>

export function toHeroSearchListings(listings: BusinessListing[]): HeroSearchListing[] {
  return listings.map(({ id, business_name, category, address, description }) => ({
    id,
    business_name,
    category,
    address,
    description,
  }))
}

export function matchesSearch(listing: HeroSearchListing, query: string) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    listing.business_name.toLowerCase().includes(q) ||
    listing.category.toLowerCase().includes(q) ||
    (listing.description?.toLowerCase().includes(q) ?? false)
  )
}

export function matchesAdminListingSearch(listing: BusinessListing, query: string) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const fields = [
    listing.business_name,
    listing.category,
    listing.description,
    listing.owner_name,
    listing.email,
    listing.phone,
    listing.whatsapp,
    listing.address,
    listing.status,
    listing.plan,
  ]
  return fields.some((field) => field?.toLowerCase().includes(q))
}

export function searchListings(listings: HeroSearchListing[], query: string, limit = 6) {
  if (!query.trim()) return []
  return listings.filter((l) => matchesSearch(l, query)).slice(0, limit)
}

export function parseCategoryParam(
  value: string | null | undefined,
  catalog?: CategoryCatalog,
): CategoryGroupId {
  const id = value?.trim().toLowerCase()
  if (!id) return "all"
  const groups = resolveGroups(catalog)
  if (groups.some((g) => g.id === id)) {
    return id as CategoryGroupId
  }
  return "all"
}

export function filterListings(
  listings: BusinessListing[],
  options: {
    search: string
    category: CategoryGroupId
    plan: PlanFilterId
    sort: SortOptionId
  },
  catalog?: CategoryCatalog,
) {
  const filtered = listings.filter(
    (l) =>
      matchesSearch(l, options.search) &&
      matchesCategoryGroup(l, options.category, catalog) &&
      matchesPlanFilter(l, options.plan),
  )
  return sortListingsByOption(filtered, options.sort)
}

export function countByCategoryGroup(
  listings: BusinessListing[],
  groupId: CategoryGroupId,
  catalog?: CategoryCatalog,
) {
  return listings.filter((l) => matchesCategoryGroup(l, groupId, catalog)).length
}

export function filterByCategoryGroup(
  listings: BusinessListing[],
  groupId: CategoryGroupId,
  catalog?: CategoryCatalog,
) {
  return listings.filter((l) => matchesCategoryGroup(l, groupId, catalog))
}

export function truncateDescription(text: string | null, max = 100) {
  if (!text) return ""
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

export function getListingImage(listing: BusinessListing) {
  const firstPhoto = listing.photo_links
    ?.split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0)
  return firstPhoto ?? DEFAULT_IMAGE
}

export function getPhotoUrls(listing: BusinessListing) {
  if (!listing.photo_links) return []
  return listing.photo_links
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Gallery photos excluding the cover (first) image shown in the hero. */
export function getGalleryPhotoUrls(listing: BusinessListing) {
  const photos = getPhotoUrls(listing)
  if (photos.length <= 1) return []
  return photos.slice(1)
}

export {
  formatWhatsAppDisplay,
  telUrl,
  whatsappShareUrl,
  whatsappUrl,
} from "@/lib/whatsapp"

export function formatListingDate(iso: string) {
  return formatSubmittedDate(iso)
}

export function isHighlightedPlan(plan: string) {
  return plan === "premium" || plan === "featured"
}
