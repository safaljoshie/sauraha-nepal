export type BlogRelatedLink = {
  href: string
  label: string
  description: string
}

/** Published long-tail guides get higher sitemap priority when live. */
export const SEO_PRIORITY_BLOG_SLUGS = new Set([
  "how-far-is-sauraha-from-kathmandu",
  "sauraha-nepal-weather-by-month",
  "is-sauraha-safe-solo-female-travellers",
  "2-days-in-sauraha-itinerary",
  "free-things-to-do-in-sauraha",
])

const BLOG_RELATED: Record<string, BlogRelatedLink[]> = {
  "how-far-is-sauraha-from-kathmandu": [
    {
      href: "/listings?category=transport",
      label: "Transport services in Sauraha",
      description: "Browse local taxis, buses and transfer operators.",
    },
    {
      href: "/blog/2-days-in-sauraha-itinerary",
      label: "2 days in Sauraha itinerary",
      description: "Plan your first visit after you arrive.",
    },
    {
      href: "/listings?category=info",
      label: "Travel information listings",
      description: "Permits, tips and practical local resources.",
    },
  ],
  "sauraha-nepal-weather-by-month": [
    {
      href: "/blog/best-time-to-visit-sauraha",
      label: "Best time to visit Sauraha & Chitwan",
      description: "Seasons, wildlife viewing and what to pack.",
    },
    {
      href: "/listings?category=activities",
      label: "Safari & activities in Sauraha",
      description: "Jeep safaris, canoe rides and cultural shows.",
    },
    {
      href: "/blog/free-things-to-do-in-sauraha",
      label: "Free things to do in Sauraha",
      description: "Village walks and riverside time without booking a safari.",
    },
  ],
  "is-sauraha-safe-solo-female-travellers": [
    {
      href: "/listings?category=guides",
      label: "Licensed tour guides",
      description: "Find experienced local guides in Sauraha.",
    },
    {
      href: "/blog/how-far-is-sauraha-from-kathmandu",
      label: "Getting to Sauraha from Kathmandu",
      description: "Bus, car and flight options explained.",
    },
    {
      href: "/listings?category=stay",
      label: "Hotels & guesthouses",
      description: "Compare verified places to stay near the park.",
    },
  ],
  "2-days-in-sauraha-itinerary": [
    {
      href: "/listings?category=activities",
      label: "Book jungle safari & activities",
      description: "Jeep safaris, canoe rides and Tharu cultural shows.",
    },
    {
      href: "/blog/free-things-to-do-in-sauraha",
      label: "Free things to do in Sauraha",
      description: "Fill gaps in your schedule without extra bookings.",
    },
    {
      href: "/listings?category=eat",
      label: "Restaurants in Sauraha",
      description: "Riverside dining and local Nepali eateries.",
    },
  ],
  "free-things-to-do-in-sauraha": [
    {
      href: "/blog/2-days-in-sauraha-itinerary",
      label: "2-day Sauraha itinerary",
      description: "Combine free activities with one paid safari day.",
    },
    {
      href: "/listings?category=activities",
      label: "Paid tours & safaris",
      description: "When you are ready to book a jeep or canoe trip.",
    },
    {
      href: "/blog/sauraha-nepal-weather-by-month",
      label: "Sauraha weather by month",
      description: "Pick the right season for village walks and river views.",
    },
  ],
}

const DEFAULT_LINKS: BlogRelatedLink[] = [
  {
    href: "/listings",
    label: "Browse Sauraha listings",
    description: "Hotels, restaurants, safaris and guides near Chitwan National Park.",
  },
  {
    href: "/listings?category=activities",
    label: "Jungle safari & activities",
    description: "Operators for jeep safari, canoe rides and cultural shows.",
  },
  {
    href: "/blog",
    label: "More travel guides",
    description: "Practical tips for visiting Sauraha and Chitwan.",
  },
]

export function getBlogPostRelatedLinks(slug: string): BlogRelatedLink[] {
  return BLOG_RELATED[slug] ?? DEFAULT_LINKS
}

/** Drop links to unpublished blog posts so related blocks never 404. */
export function filterBlogRelatedLinks(
  links: BlogRelatedLink[],
  publishedSlugs: ReadonlySet<string>,
): BlogRelatedLink[] {
  const isPublishedBlogLink = (href: string) => {
    if (!href.startsWith("/blog/") || href === "/blog") return true
    return publishedSlugs.has(href.slice("/blog/".length))
  }

  const filtered = links.filter((link) => isPublishedBlogLink(link.href))
  if (filtered.length > 0) return filtered

  return DEFAULT_LINKS.filter((link) => isPublishedBlogLink(link.href))
}
