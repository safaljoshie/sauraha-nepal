import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { SITE_URL } from "@/lib/blog-posts"
import {
  buildGuideProfilePath,
  buildGuideProfileUrl,
  type TourGuide,
} from "@/lib/tour-guides"

export const GUIDES_PAGE_PATH = "/guides"

export const GUIDES_KEYWORDS = [
  "Sauraha jungle guide",
  "Sauraha jungle guides",
  "jungle guide in Sauraha",
  "Chitwan jungle guide",
  "Chitwan National Park guide",
  "verified jungle guides in Sauraha",
  "local nature guide Sauraha",
  "bird watching guide Sauraha",
  "jungle walk guide Chitwan",
] as const

export const GUIDES_PAGE_TITLE = "Sauraha Jungle Guides | Find Local Chitwan Nature Guides"

export const GUIDES_PAGE_DESCRIPTION =
  "Find verified Sauraha jungle guides for Chitwan National Park walks, bird watching, jeep safaris and cultural tours. Browse local profiles, compare experience and contact guides directly."

/** Maps UI speciality filters to expertise tags stored in the database. */
export const SPECIALITY_FILTERS = [
  {
    key: "jungle-walk",
    label: "Jungle walk",
    expertise: ["Walking Tour", "Wildlife Tracking", "Jungle Safari"],
  },
  {
    key: "bird-watching",
    label: "Bird watching",
    expertise: ["Bird Watching"],
  },
  {
    key: "wildlife-photography",
    label: "Wildlife photography",
    expertise: ["Photography Tour"],
  },
  {
    key: "jeep-safari",
    label: "Jeep safari",
    expertise: ["Jeep Safari", "Jungle Safari", "Night Safari"],
  },
  {
    key: "canoeing",
    label: "Canoeing",
    expertise: ["Canoe/Boat"],
  },
  {
    key: "cultural",
    label: "Cultural experience",
    expertise: ["Tharu Culture", "Village Tour"],
  },
] as const

export type SpecialityFilterKey = (typeof SPECIALITY_FILTERS)[number]["key"]

export const EXPERIENCE_FILTER_OPTIONS = [
  { value: "any", label: "Any experience" },
  { value: "5", label: "5+ years" },
  { value: "10", label: "10+ years" },
  { value: "15", label: "15+ years" },
] as const

export const GUIDE_TYPE_CARDS = [
  {
    title: "Jungle Walk Guides",
    description:
      "Explore sal forest and grassland on foot with guides who know wildlife trails, animal signs and safe viewing distances.",
    icon: "map" as const,
  },
  {
    title: "Bird-Watching Guides",
    description:
      "Spot hornbills, storks and migratory species with local naturalists familiar with hides, marshes and dawn routes.",
    icon: "binoculars" as const,
  },
  {
    title: "Wildlife Photography Guides",
    description:
      "Find patient guides who understand light, movement and park rules to help you photograph rhinos, deer and birds responsibly.",
    icon: "camera" as const,
  },
  {
    title: "Jeep Safari Guides",
    description:
      "Join experienced guides for jeep safaris inside or near Chitwan National Park — wildlife interpretation from the vehicle.",
    icon: "car" as const,
  },
  {
    title: "Canoe and Riverside Guides",
    description:
      "Glide the Rapti or Narayani at sunrise with guides who know crocodile country, river birds and safe landing points.",
    icon: "compass" as const,
  },
  {
    title: "Cultural Guides",
    description:
      "Visit Tharu villages, museums and community areas with guides who share local history, crafts and everyday life.",
    icon: "heart" as const,
  },
] as const

export const GUIDES_FAQ = [
  {
    question: "How do I hire a Sauraha jungle guide?",
    answer:
      "Browse verified profiles on this page, filter by language or speciality, then contact a guide directly by phone or WhatsApp. Confirm dates, group size and what is included before you travel.",
  },
  {
    question: "Do I need a guide for Chitwan National Park?",
    answer:
      "Park rules and entry requirements can change. Many visitors use licensed guides for jungle walks, safaris and interpretation. Always confirm current permit and guide requirements with your guide or park authorities before visiting.",
  },
  {
    question: "What is the difference between a guide and a safari operator?",
    answer:
      "A guide provides local expertise and interpretation. Safari operators may supply vehicles, permits and packaged tours. Some guides work independently; others partner with lodges or operators. Ask what each profile includes when you enquire.",
  },
  {
    question: "How much does a jungle guide in Sauraha cost?",
    answer:
      "Prices vary by tour type, duration, group size and season. Guides who list services show starting prices on their profile. Confirm the full cost — including transport, park fees and extras — directly with the guide.",
  },
  {
    question: "Can I book a bird watching guide directly?",
    answer:
      "Yes. Filter profiles by bird watching or search by name, then message a guide to discuss timing, terrain and equipment. Early-morning walks are popular in winter and spring.",
  },
  {
    question: "What does “verified guide” mean on Sauraha Nepal?",
    answer:
      "Verified guides have had identity and licence details checked by our team before approval. Verification supports trust but does not replace your own due diligence — always confirm availability and terms directly.",
  },
  {
    question: "Are park entry permits included in guide fees?",
    answer:
      "Not always. Permit rules, fees and what must be arranged separately can change. Ask your guide whether park entry, community forest fees or vehicle costs are included in their quoted price.",
  },
  {
    question: "What languages do jungle guides in Sauraha speak?",
    answer:
      "Many guides speak Nepali and English; others offer Hindi, Tharu or additional languages. Each profile lists spoken languages — use the language filter to narrow your search.",
  },
] as const

export type GuidesRelatedLink = {
  href: string
  label: string
  description: string
}

/** Internal links to existing site pages only. */
export const GUIDES_RELATED_LINKS: GuidesRelatedLink[] = [
  {
    href: "/blog/free-things-to-do-in-sauraha",
    label: "Things to do in Sauraha",
    description: "Free walks, riverside time and village experiences to combine with a guided day.",
  },
  {
    href: "/listings?category=activities",
    label: "Jungle safari & activities",
    description: "Jeep safaris, canoe rides, cultural shows and activity operators near the park.",
  },
  {
    href: "/listings?category=activities",
    label: "Bird watching & nature tours",
    description: "Browse activity listings that complement a dedicated birding guide.",
  },
  {
    href: "/listings?category=activities",
    label: "Jeep safari operators",
    description: "Compare safari packages and operators in Sauraha.",
  },
  {
    href: "/listings?category=activities",
    label: "Canoeing on the Rapti River",
    description: "Find canoe and riverside experiences near Chitwan National Park.",
  },
  {
    href: "/blog",
    label: "Chitwan travel guides",
    description: "Permits, seasons, transport and practical tips for visiting Sauraha.",
  },
  {
    href: "/listings?category=stay",
    label: "Hotels & accommodation",
    description: "Places to stay near Chitwan National Park before or after your guided day.",
  },
  {
    href: "/listings?category=eat",
    label: "Restaurants in Sauraha",
    description: "Riverside dining and local Nepali food after a morning in the jungle.",
  },
  {
    href: "/list-your-guide",
    label: "List your guide profile",
    description: "Are you a local guide? Apply to appear in this directory.",
  },
]

// Routes omitted — no dedicated pages exist yet:
// /jungle-walk, /bird-watching, /jeep-safari, /canoeing, /chitwan-national-park

export function guideMatchesSpeciality(guide: TourGuide, key: SpecialityFilterKey) {
  const filter = SPECIALITY_FILTERS.find((item) => item.key === key)
  if (!filter) return true
  return filter.expertise.some((tag) => guide.expertise.includes(tag))
}

export function guideMatchesMinExperience(guide: TourGuide, minYears: string) {
  if (minYears === "any") return true
  const min = Number(minYears)
  if (!Number.isFinite(min)) return true
  return (guide.years_experience ?? 0) >= min
}

export function buildGuidesIndexJsonLd(guides: TourGuide[]) {
  const pageUrl = `${SITE_URL}${GUIDES_PAGE_PATH}`

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jungle Guides",
        item: pageUrl,
      },
    ],
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GUIDES_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified jungle guides in Sauraha",
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildGuideProfileUrl(guide),
      name: guide.full_name,
    })),
  }

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sauraha Jungle Guides",
    description: GUIDES_PAGE_DESCRIPTION,
    url: pageUrl,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    mainEntity: itemList,
  }

  return [collectionPage, breadcrumb, faqPage, itemList]
}

export function buildGuideProfileJsonLd(guide: TourGuide) {
  const profileUrl = buildGuideProfileUrl(guide)

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jungle Guides",
        item: `${SITE_URL}${GUIDES_PAGE_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.full_name,
        item: profileUrl,
      },
    ],
  }

  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guide.full_name,
    jobTitle: "Jungle Guide",
    url: profileUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: guide.location?.trim() || "Sauraha",
      addressRegion: "Chitwan",
      addressCountry: "NP",
    },
  }

  if (guide.bio?.trim()) person.description = guide.bio.trim()
  if (guide.phone?.trim()) person.telephone = guide.phone.trim()
  if (guide.photo_url?.trim()) person.image = guide.photo_url.trim()
  if (guide.languages.length > 0) {
    person.knowsLanguage = guide.languages
  }

  return [person, breadcrumb]
}

export function buildGuideProfileTitle(guide: Pick<TourGuide, "full_name" | "meta_title">) {
  return guide.meta_title?.trim() || `${guide.full_name} | Jungle Guide in Sauraha, Chitwan`
}

export function buildGuideProfilePathForLink(guide: Pick<TourGuide, "id" | "slug">) {
  return buildGuideProfilePath(guide)
}
