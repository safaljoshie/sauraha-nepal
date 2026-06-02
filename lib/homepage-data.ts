import type { BusinessListing } from "@/lib/business-listing"
import { activityPlaceholders } from "@/lib/data"
import {
  CATEGORY_GROUPS,
  countByCategoryGroup,
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
  }
  categories: HomepageCategory[]
  featured: BusinessListing[]
  activities: ActivityCardItem[]
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
    c.includes("cultural")
  )
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

  const categoryCount = CATEGORY_GROUPS.filter(
    (g) => g.id !== "all" && countByCategoryGroup(listings, g.id) > 0,
  ).length

  const featured = sorted.slice(0, 6)

  const realActivities = sorted.filter(isActivityListing).slice(0, 5)
  const activities: ActivityCardItem[] = realActivities.map((listing) => ({
    type: "listing",
    listing,
  }))

  for (let i = 0; activities.length < 5 && i < activityPlaceholders.length; i++) {
    const p = activityPlaceholders[i]
    activities.push({
      type: "placeholder",
      name: p.name,
      description: p.description,
      image: p.image,
      href: "/listings?category=activities",
    })
  }

  return {
    listings: sorted,
    stats: {
      businessCount: listings.length,
      categoryCount,
    },
    categories,
    featured,
    activities,
  }
}
