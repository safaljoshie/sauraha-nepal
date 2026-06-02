import type { BusinessListing } from "@/lib/business-listing"
import { formatSubmittedDate } from "@/lib/business-listing"

export type CategoryGroupId =
  | "all"
  | "stay"
  | "eat"
  | "activities"
  | "transport"
  | "shopping"
  | "guides"
  | "info"

export type PlanFilterId = "all" | "basic" | "featured" | "premium"

export type SortOptionId = "newest" | "az" | "plan"

export const PAGE_SIZE = 9

export const CATEGORY_GROUPS: {
  id: CategoryGroupId
  label: string
  tabLabel: string
  matchers: string[]
}[] = [
  { id: "all", label: "All", tabLabel: "All", matchers: [] },
  {
    id: "stay",
    label: "Stay",
    tabLabel: "🏨 Stay",
    matchers: ["Hotel", "Resort", "Guesthouse", "Homestay"],
  },
  {
    id: "eat",
    label: "Eat & Drink",
    tabLabel: "🍽️ Eat & Drink",
    matchers: [
      "Restaurant",
      "Cafe",
      "Bar",
      "Tea Shop",
      "Bakery",
      "Street Food",
      "Liquor Shop",
    ],
  },
  {
    id: "activities",
    label: "Activities",
    tabLabel: "🐘 Activities",
    matchers: ["Safari", "Canoe/Boat", "Birdwatching", "Cultural Show"],
  },
  {
    id: "transport",
    label: "Transport",
    tabLabel: "🚗 Transport",
    matchers: ["Taxi/Jeep", "Bus Service", "Cycle Rental", "Scooty Rental"],
  },
  {
    id: "shopping",
    label: "Shopping",
    tabLabel: "🛍️ Shopping",
    matchers: [
      "Souvenirs",
      "Clothing",
      "Tattoo Shop",
      "Grocery Shop",
      "Chemist/Pharmacy",
    ],
  },
  {
    id: "guides",
    label: "Tour Guides",
    tabLabel: "🧭 Tour Guides",
    matchers: ["Licensed Guide", "Tour Operator"],
  },
  { id: "info", label: "Travel Info", tabLabel: "ℹ️ Travel Info", matchers: [] },
]

const PLAN_ORDER: Record<string, number> = {
  premium: 0,
  featured: 1,
  basic: 2,
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"

export function getCategoryGroupId(category: string): CategoryGroupId {
  const group = CATEGORY_GROUPS.find(
    (g) => g.id !== "all" && g.matchers.includes(category),
  )
  return group?.id ?? "info"
}

export function getCategoryDisplay(category: string) {
  const group = CATEGORY_GROUPS.find(
    (g) => g.id !== "all" && g.matchers.includes(category),
  )
  if (group) return group.tabLabel
  return `ℹ️ ${category}`
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
) {
  if (groupId === "all") return true
  const group = CATEGORY_GROUPS.find((g) => g.id === groupId)
  if (!group) return false
  if (groupId === "info") {
    return !CATEGORY_GROUPS.some(
      (g) => g.id !== "all" && g.id !== "info" && g.matchers.includes(listing.category),
    )
  }
  return group.matchers.includes(listing.category)
}

export function matchesPlanFilter(listing: BusinessListing, plan: PlanFilterId) {
  if (plan === "all") return true
  return listing.plan === plan
}

export function matchesSearch(listing: BusinessListing, query: string) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    listing.business_name.toLowerCase().includes(q) ||
    listing.category.toLowerCase().includes(q) ||
    (listing.description?.toLowerCase().includes(q) ?? false)
  )
}

export function searchListings(listings: BusinessListing[], query: string, limit = 6) {
  if (!query.trim()) return []
  return listings.filter((l) => matchesSearch(l, query)).slice(0, limit)
}

export function parseCategoryParam(value: string | null | undefined): CategoryGroupId {
  const id = value?.trim().toLowerCase()
  if (id && CATEGORY_GROUPS.some((g) => g.id === id)) {
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
) {
  const filtered = listings.filter(
    (l) =>
      matchesSearch(l, options.search) &&
      matchesCategoryGroup(l, options.category) &&
      matchesPlanFilter(l, options.plan),
  )
  return sortListingsByOption(filtered, options.sort)
}

export function countByCategoryGroup(
  listings: BusinessListing[],
  groupId: CategoryGroupId,
) {
  return listings.filter((l) => matchesCategoryGroup(l, groupId)).length
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

export { formatWhatsAppDisplay, whatsappShareUrl, whatsappUrl } from "@/lib/whatsapp"

export function formatListingDate(iso: string) {
  return formatSubmittedDate(iso)
}

export function isHighlightedPlan(plan: string) {
  return plan === "premium" || plan === "featured"
}
