export const categories = [
  { icon: "hotel", name: "Stay", count: "38 listings", href: "/listings?category=stay" },
  { icon: "utensils", name: "Eat & Drink", count: "24 listings", href: "/listings?category=eat" },
  { icon: "binoculars", name: "Activities", count: "18 listings", href: "/listings?category=activities" },
  { icon: "car", name: "Transport", count: "12 listings", href: "/listings?category=transport" },
  { icon: "shopping-bag", name: "Shopping", count: "16 listings", href: "/listings?category=shopping" },
  { icon: "compass", name: "Tour Guides", count: "14 listings", href: "/listings?category=guides" },
] as const

export const categoryTabs = [
  { label: "All", slug: "all" },
  { label: "Stay", slug: "stay" },
  { label: "Eat & Drink", slug: "eat" },
  { label: "Activities", slug: "activities" },
  { label: "Transport", slug: "transport" },
  { label: "Shopping", slug: "shopping" },
  { label: "Tour Guides", slug: "guides" },
] as const

export type Listing = {
  image: string
  badge?: string
  category: string
  name: string
  description: string
  location: string
  price: string
  rating: number
  reviews: number
}

export const featuredListings: Listing[] = [
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    badge: "Featured",
    category: "Resort",
    name: "Jungle Wildlife Camp",
    description: "Luxury tents and cottages on the edge of Chitwan National Park.",
    location: "Sauraha, Chitwan",
    price: "$$",
    rating: 4.8,
    reviews: 142,
  },
  {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    badge: "Popular",
    category: "Restaurant",
    name: "Tharu Kitchen & Bar",
    description: "Authentic Tharu cuisine and cold drinks with river views.",
    location: "Main Road, Sauraha",
    price: "$",
    rating: 4.6,
    reviews: 98,
  },
  {
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&q=80",
    badge: "Top Rated",
    category: "Activity",
    name: "Chitwan Jeep Safari",
    description: "Full-day jeep safari inside Chitwan National Park.",
    location: "Chitwan National Park",
    price: "$$$",
    rating: 4.9,
    reviews: 210,
  },
]

export const allListings: Listing[] = [
  ...featuredListings,
  {
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&q=80",
    category: "Guesthouse",
    name: "Rapti River Guesthouse",
    description: "Cosy riverside rooms with great sunset views. Great value for budget travellers.",
    location: "Rapti River, Sauraha",
    price: "$",
    rating: 4.4,
    reviews: 67,
  },
  {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80",
    category: "Activity",
    name: "Sunrise Canoe Ride",
    description: "Peaceful dawn canoe ride on the Rapti River. Watch crocodiles and birds from the water.",
    location: "Rapti River, Sauraha",
    price: "$",
    rating: 4.7,
    reviews: 156,
  },
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    badge: "Verified",
    category: "Tour Guide",
    name: "Ram's Chitwan Tours",
    description: "Licensed local guide with 15 years experience. Jungle walks, bird tours & cultural experiences.",
    location: "Sauraha, Chitwan",
    price: "$$",
    rating: 5.0,
    reviews: 88,
  },
]

export const activityPlaceholders = [
  {
    name: "Jungle Safari",
    description: "Jeep & elephant safaris",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
  },
  {
    name: "Canoe Ride",
    description: "Rapti River at sunrise",
    image: "/images/canoe-ride-sauraha.png",
  },
  {
    name: "Birdwatching",
    description: "500+ species spotted",
    image: "https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=600&q=80",
  },
  {
    name: "Tharu Culture",
    description: "Traditional dance & music",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    name: "Nature Walk",
    description: "Guided jungle treks",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  },
] as const

/** @deprecated Use activityPlaceholders */
export const activities = activityPlaceholders

export const blogPosts = [
  {
    tag: "Guide",
    title: "Best time to visit Sauraha & Chitwan",
    meta: "October to March is peak season · 5 min read",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    href: "/blog/best-time-to-visit-sauraha",
  },
  {
    tag: "Transport",
    title: "How to get to Sauraha from Kathmandu",
    meta: "Bus, flight & private options · 4 min read",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80",
    href: "/blog/how-to-get-to-sauraha-from-kathmandu-and-pokhara-2026-travel-guide",
  },
  {
    tag: "Info",
    title: "Chitwan National Park entry fees & permits",
    meta: "Updated 2025 · 3 min read",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
    href: "/blog/park-permits-to-visit-sauraha-community-forest-vs-national-forest-2026-guide",
  },
] as const

export const missionCards = [
  {
    icon: "tree-pine",
    title: "Sustainable Tourism",
    description:
      "We promote eco-friendly travel that protects Chitwan's wildlife and supports local communities.",
  },
  {
    icon: "heart",
    title: "Local First",
    description:
      "Every listing is a locally owned business. We help travellers connect directly with Sauraha's people.",
  },
  {
    icon: "sparkles",
    title: "Verified Listings",
    description:
      "We personally review every business before listing to ensure quality and honest information.",
  },
  {
    icon: "map-pin",
    title: "Local Knowledge",
    description: "Our guides and travel tips come from people who live and breathe Sauraha every day.",
  },
] as const

export const teamMembers = [
  {
    name: "Ramesh Tharu",
    role: "Founder & Local Guide",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    name: "Sunita Adhikari",
    role: "Content & Listings",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    name: "Bikash Gurung",
    role: "Photography & Media",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
  },
] as const

export const listingBenefits = [
  { icon: "globe", title: "Global Reach", description: "Appear in front of international travellers planning Chitwan trips." },
  { icon: "smartphone", title: "Mobile Friendly", description: "Your listing looks great on every phone and tablet." },
  { icon: "star", title: "Reviews & Ratings", description: "Build trust with verified customer reviews." },
  { icon: "map-pin", title: "Google Maps Pin", description: "Help guests find you with an accurate map location." },
  { icon: "camera", title: "Photo Gallery", description: "Showcase your rooms, food, or safari experiences." },
  { icon: "message-circle", title: "Direct WhatsApp", description: "Let customers message you instantly from your listing." },
] as const

export const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    period: "forever",
    popular: false,
    features: [
      "Business name & category",
      "Contact details",
      "Location & map pin",
      "1 photo",
      "Customer reviews",
    ],
  },
  {
    name: "Featured",
    price: "NPR 5,000",
    period: "per year",
    popular: true,
    features: [
      "Everything in Basic",
      "Featured placement in search",
      "WhatsApp button",
      "Up to 10 photos",
      "Business description",
      "Opening hours",
      "Website & social links",
    ],
  },
  {
    name: "Premium",
    price: "NPR 12,000",
    period: "per year",
    popular: false,
    features: [
      "Everything in Featured",
      "Homepage featured section",
      "Banner ad placement",
      "Up to 20 photos",
      "Video embed",
      "Priority review approval",
      "Monthly performance report",
      "Social media mention",
    ],
  },
] as const

export const listingSteps = [
  { step: "1", title: "Fill the Form", description: "Tell us about your business in a few minutes." },
  { step: "2", title: "We Review", description: "Our team reviews your submission within 24–48 hours." },
  { step: "3", title: "Go Live", description: "Your listing appears on Sauraha Nepal for travellers to find." },
  { step: "4", title: "Get Bookings", description: "Connect directly with customers — no commission fees." },
] as const

