export type BlogPost = {
  slug: string
  title: string
  description: string
  tag: string
  readTime: string
  date: string
  image: string
  href: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-time-to-visit-sauraha",
    title: "Best Time to Visit Sauraha & Chitwan National Park",
    description:
      "Seasonal guide to visiting Sauraha and Chitwan — weather, wildlife, and travel tips by month.",
    tag: "Guide",
    readTime: "5 min read",
    date: "2025-01-15",
    image: "/images/sauraha-hero.jpg",
    href: "/blog/best-time-to-visit-sauraha",
  },
  {
    slug: "how-to-get-to-sauraha",
    title: "How to Get to Sauraha from Kathmandu",
    description:
      "Bus, flight, private car, and local transport options from Kathmandu and Pokhara to Sauraha.",
    tag: "Transport",
    readTime: "4 min read",
    date: "2025-02-01",
    image: "/images/kathmandu-to-sauraha.jpg",
    href: "/blog/how-to-get-to-sauraha",
  },
  {
    slug: "chitwan-national-park-entry-fees",
    title: "Chitwan National Park Entry Fees & Permits 2025",
    description:
      "Current park entry fees, permit locations, safari and canoe costs, and money-saving tips.",
    tag: "Info",
    readTime: "3 min read",
    date: "2025-03-01",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
    href: "/blog/chitwan-national-park-entry-fees",
  },
]

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getRelatedPosts(currentSlug: string, limit = 2) {
  return BLOG_POSTS.filter((post) => post.slug !== currentSlug).slice(0, limit)
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.saurahanepal.com"
