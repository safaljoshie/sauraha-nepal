import type { CategoryGroupId } from "@/lib/listings-catalog"

export const HOME_EXPERIENCES = [
  {
    name: "Jungle Safari",
    description: "Jeep and elephant safaris through Chitwan's forests with expert naturalists.",
    image: "/images/jungle-safari-sauraha.png",
    href: "/listings?category=activities",
    cta: "Find safaris",
  },
  {
    name: "Canoe Ride",
    description: "Peaceful dawn canoe trips on the Rapti River — crocodiles, birds, and river life.",
    image: "/images/canoe-ride-sauraha.png",
    href: "/listings?category=activities",
    cta: "Book a canoe ride",
  },
  {
    name: "Tharu Cultural Show",
    description: "Traditional Tharu dance, music, and storytelling at community cultural centres.",
    image: "/images/tharu-cultural-show-sauraha.png",
    href: "/listings?category=activities",
    cta: "See cultural shows",
  },
  {
    name: "Bird Watching",
    description: "Over 500 species — guided walks and hides for beginners and enthusiasts.",
    image: "https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=800&q=80",
    href: "/listings?category=activities",
    cta: "Explore birding",
  },
  {
    name: "Elephant Breeding Centre",
    description: "Visit the conservation centre and learn about ethical elephant care in Chitwan.",
    image: "/images/elephant-breeding-centre-sauraha.png",
    href: "/listings?category=activities",
    cta: "Plan your visit",
  },
  {
    name: "Cycling Tour",
    description: "Village roads, rice fields, and quiet trails around Sauraha at your own pace.",
    image: "/images/cycling-tour-sauraha.png",
    href: "/listings?category=transport",
    cta: "Find bike rentals",
  },
] as const

export const PLAN_TRIP_STEPS = [
  { step: 1, title: "Choose travel dates", description: "October–March is peak wildlife season.", icon: "📅" },
  { step: 2, title: "Find accommodation", description: "Hotels, resorts, and homestays in Sauraha.", icon: "🏨" },
  { step: 3, title: "Book activities", description: "Safaris, canoe rides, and cultural experiences.", icon: "🐘" },
  { step: 4, title: "Explore restaurants", description: "Local Tharu cuisine and riverside dining.", icon: "🍽️" },
  { step: 5, title: "Get travel information", description: "Permits, transport, and insider guides.", icon: "📖" },
] as const

export const EAT_SHOWCASE = [
  {
    title: "Local Nepali Food",
    description: "Dal bhat, Tharu specialities, and family-run kitchens.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80",
    href: "/listings?category=eat",
  },
  {
    title: "International Cuisine",
    description: "Comfort food and global flavours for every traveller.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    href: "/listings?category=eat",
  },
  {
    title: "Cafes",
    description: "Coffee, pastries, and relaxed spots to plan your day.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    href: "/listings?category=eat",
  },
  {
    title: "Riverside Dining",
    description: "Sunset meals overlooking the Rapti and Chitwan forests.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    href: "/listings?category=eat",
  },
] as const

export const MAP_FILTER_GROUPS: { id: CategoryGroupId | "medical"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stay", label: "Hotels" },
  { id: "eat", label: "Restaurants" },
  { id: "activities", label: "Activities" },
  { id: "shopping", label: "Shopping" },
  { id: "transport", label: "Transport" },
  { id: "medical", label: "Medical" },
]

export const TESTIMONIALS = [
  {
    quote: "Our jungle safari from Sauraha was the highlight of our Nepal trip — well organised and unforgettable.",
    name: "Sarah M.",
    from: "United Kingdom",
  },
  {
    quote: "The directory made it easy to find a riverside hotel and book a canoe at sunrise. Highly recommend.",
    name: "Raj K.",
    from: "India",
  },
  {
    quote: "Perfect for planning Chitwan — clear listings, WhatsApp contact, and honest local tips.",
    name: "Emma L.",
    from: "Australia",
  },
] as const

export const TRAVELLER_PHOTOS = [
  "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80",
  "/images/canoe-ride-sauraha.png",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  "https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=400&q=80",
] as const

export const WHY_VISIT_HIGHLIGHTS = [
  "One-horned rhinoceros in the wild",
  "Chitwan National Park — UNESCO World Heritage",
  "Canoe safaris on the Rapti River",
  "Tharu culture and community experiences",
  "Bird watching with 500+ species",
  "Jungle adventures for every budget",
] as const

/** Visit NSW–style destination tiles */
export const PLACES_TO_GO = [
  {
    name: "Chitwan National Park",
    tagline: "UNESCO World Heritage wildlife & jungle safaris",
    image: "/images/home-hero.png",
    href: "/listings?category=activities",
  },
  {
    name: "Sauraha Village",
    tagline: "Riverside stays, restaurants & local life",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    href: "/listings?category=stay",
  },
  {
    name: "Rapti River",
    tagline: "Sunset canoe rides & crocodile country",
    image: "/images/canoe-ride-sauraha.png",
    href: "/listings?category=activities",
  },
  {
    name: "Tharu Communities",
    tagline: "Culture, dance & village experiences",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    href: "/listings?category=activities",
  },
  {
    name: "Community Forest",
    tagline: "Walking trails & bird watching",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    href: "/blog/park-permits-to-visit-sauraha-community-forest-vs-national-forest-2026-guide",
  },
  {
    name: "Elephant Breeding Centre",
    tagline: "Conservation & ethical wildlife learning",
    image: "https://images.unsplash.com/photo-1557050543-4d1f39a78991?w=800&q=80",
    href: "/listings?category=activities",
  },
] as const

export const SEARCH_CATEGORIES = [
  { label: "Hotels", href: "/listings?category=stay" },
  { label: "Activities", href: "/listings?category=activities" },
  { label: "Restaurants", href: "/listings?category=eat" },
  { label: "Travel Guides", href: "/blog" },
] as const
