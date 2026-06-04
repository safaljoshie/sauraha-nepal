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
    image: "/images/birdwatching-sauraha.png",
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
    image: "/images/local-nepali-food-sauraha.png",
    href: "/listings?category=eat",
  },
  {
    title: "International Cuisine",
    description: "Comfort food and global flavours for every traveller.",
    image: "/images/international-cuisine-sauraha.png",
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
    image: "/images/riverside-dining-sauraha.png",
    href: "/listings?category=eat",
  },
] as const

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

/** Gallery below testimonials — same images as Things to do. */
export const TRAVELLER_PHOTOS = HOME_EXPERIENCES.map((exp) => ({
  src: exp.image,
  alt:
    exp.name === "Bird Watching"
      ? "Chinese pond heron in a green marsh — birdwatching in Sauraha and Chitwan"
      : exp.name === "Elephant Breeding Centre"
        ? "Baby elephant at the breeding centre in Sauraha and Chitwan"
        : `${exp.name} in Sauraha and Chitwan`,
}))

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
    image: "/images/sauraha-village.png",
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
    image: "/images/tharu-communities-sauraha.png",
    href: "/listings?category=activities",
  },
  {
    name: "Community Forest",
    tagline: "Walking trails & bird watching",
    image: "/images/community-forest-sauraha.png",
    href: "/blog/park-permits-to-visit-sauraha-community-forest-vs-national-forest-2026-guide",
  },
  {
    name: "Elephant Breeding Centre",
    tagline: "Conservation & ethical wildlife learning",
    image: "/images/elephant-breeding-centre-places.png",
    href: "/listings?category=activities",
  },
] as const

