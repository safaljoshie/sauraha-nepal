import type { BusinessListing } from "@/lib/business-listing"
import { HOME_EXPERIENCES } from "@/lib/homepage-constants"
import {
  countByCategoryGroup,
  filterByCategoryGroup,
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

const HOMEPAGE_CATEGORIES: {
  slug: CategoryGroupId
  icon: string
  name: string
}[] = [
  { slug: "stay", icon: "🏨", name: "Stay" },
  { slug: "eat", icon: "🍽️", name: "Eat & Drink" },
  { slug: "activities", icon: "🐘", name: "Activities" },
  { slug: "transport", icon: "🚗", name: "Transport" },
  { slug: "shopping", icon: "🛍️", name: "Shopping" },
  { slug: "guides", icon: "🧭", name: "Tour Guides" },
  { slug: "info", icon: "ℹ️", name: "Travel Info" },
]

export function isActivityListing(listing: BusinessListing) {
  const c = listing.category.toLowerCase()
  return (
    c.includes("activ") ||
    c.includes("safari") ||
    c.includes("canoe") ||
    c.includes("bird") ||
    c.includes("cultural") ||
    c.includes("culture") ||
    c.includes("walk")
  )
}

function countUniqueCategories(listings: BusinessListing[]) {
  const seen = new Set<string>()
  for (const listing of listings) {
    const category = listing.category?.trim()
    if (category) seen.add(category.toLowerCase())
  }
  return seen.size
}

export function buildHomepageData(listings: BusinessListing[]): HomepageData {
  const sorted = sortListingsForDisplay(listings)

  const categories: HomepageCategory[] = HOMEPAGE_CATEGORIES.map(({ slug, icon, name }) => {
    const count = countByCategoryGroup(listings, slug)
    return {
      icon,
      name,
      slug,
      count,
      countLabel:
        count === 0 ? "Coming soon" : `${count} listing${count === 1 ? "" : "s"}`,
      href: `/listings?category=${slug}`,
    }
  })

  const categoryCount = countUniqueCategories(listings)

  const featured = sorted.slice(0, 6)

  const realActivities = sorted.filter(isActivityListing).slice(0, 5)
  const activities: ActivityCardItem[] = realActivities.map((listing) => ({
    type: "listing",
    listing,
  }))

  const stayListings = filterByCategoryGroup(sorted, "stay").slice(0, 4)
  const eatListings = filterByCategoryGroup(sorted, "eat").slice(0, 4)

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
): BusinessListing[] {
  if (filter === "all") return listings
  if (filter === "medical") {
    return listings.filter((l) =>
      /chemist|pharmacy|medical|clinic|hospital/i.test(l.category),
    )
  }
  return filterByCategoryGroup(listings, filter)
}
