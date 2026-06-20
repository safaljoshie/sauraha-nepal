import type { BusinessListing } from "@/lib/business-listing"
import type { CategoryCatalog } from "@/lib/category-catalog"
import { DEFAULT_CATEGORY_CATALOG } from "@/lib/category-catalog"
import { resolveCategoryIconName } from "@/lib/category-icon-map"
import { HOME_EXPERIENCES } from "@/lib/homepage-constants"
import {
  countByCategoryGroup,
  filterByCategoryGroup,
  matchesCategoryGroup,
  sortListingsForDisplay,
  type CategoryGroupId,
} from "@/lib/listings-catalog"

export type HomepageCategory = {
  icon: string
  name: string
  slug: CategoryGroupId
  count: number
  countLabel: string
  href: string
}

export type ActivityCardItem =
  | { type: "listing"; listing: BusinessListing }
  | {
      type: "placeholder"
      name: string
      description: string
      image: string
      href: string
    }

export type HomepageData = {
  listings: BusinessListing[]
  stats: {
    businessCount: number
    categoryCount: number
    guidesCount: number
  }
  categories: HomepageCategory[]
  featured: BusinessListing[]
  stayListings: BusinessListing[]
  eatListings: BusinessListing[]
  activities: ActivityCardItem[]
  experiences: typeof HOME_EXPERIENCES
}

export function isActivityListing(listing: BusinessListing, catalog: CategoryCatalog) {
  return matchesCategoryGroup(listing, "activities", catalog)
}

function countUniqueCategories(listings: BusinessListing[]) {
  const seen = new Set<string>()
  for (const listing of listings) {
    const category = listing.category?.trim()
    if (category) seen.add(category.toLowerCase())
  }
  return seen.size
}

export function buildHomepageData(
  listings: BusinessListing[],
  catalog: CategoryCatalog = DEFAULT_CATEGORY_CATALOG,
): HomepageData {
  const sorted = sortListingsForDisplay(listings)

  const categories: HomepageCategory[] = catalog.builtGroups
    .filter((g) => g.id !== "all")
    .map((g) => {
      const dbGroup = catalog.groups.find((row) => row.slug === g.id)
      const count = countByCategoryGroup(listings, g.id, catalog)
      return {
        icon: resolveCategoryIconName(g.id as string, dbGroup?.icon),
        name: g.label,
        slug: g.id,
        count,
        countLabel:
          count === 0 ? "Coming soon" : `${count} listing${count === 1 ? "" : "s"}`,
        href: g.id === "info" ? "/listings?category=info" : `/listings?category=${g.id}`,
      }
    })

  const categoryCount = countUniqueCategories(listings)

  const featured = sorted.slice(0, 6)

  const realActivities = sorted.filter((l) => isActivityListing(l, catalog)).slice(0, 5)
  const activities: ActivityCardItem[] = realActivities.map((listing) => ({
    type: "listing",
    listing,
  }))

  const stayListings = filterByCategoryGroup(sorted, "stay", catalog).slice(0, 4)
  const eatListings = filterByCategoryGroup(sorted, "eat", catalog).slice(0, 4)

  return {
    listings: sorted,
    stats: {
      businessCount: listings.length,
      categoryCount,
      guidesCount: 0,
    },
    categories,
    featured,
    stayListings,
    eatListings,
    activities,
    experiences: HOME_EXPERIENCES,
  }
}

export function listingsForMapFilter(
  listings: BusinessListing[],
  filter: CategoryGroupId | "medical" | "all",
  catalog: CategoryCatalog = DEFAULT_CATEGORY_CATALOG,
): BusinessListing[] {
  if (filter === "all") return listings
  if (filter === "medical") {
    return listings.filter((l) =>
      /chemist|pharmacy|medical|clinic|hospital/i.test(l.category),
    )
  }
  return filterByCategoryGroup(listings, filter, catalog)
}

export function buildMapFilterGroups(catalog: CategoryCatalog) {
  return [
    { id: "all" as const, label: "All" },
    ...catalog.builtGroups
      .filter((g) => g.id !== "all" && g.id !== "info")
      .map((g) => ({ id: g.id as CategoryGroupId, label: g.label })),
    { id: "medical" as const, label: "Medical" },
  ]
}
