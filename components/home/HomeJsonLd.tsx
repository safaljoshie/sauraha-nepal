import type { BusinessListing } from "@/lib/business-listing"
import { getListingImage } from "@/lib/listings-catalog"

const SITE = "https://www.saurahanepal.com"

const FAQ = [
  {
    question: "What is the best time to visit Sauraha?",
    answer:
      "October through March offers comfortable weather and excellent wildlife viewing. Monsoon (June–September) is quieter with lush landscapes.",
  },
  {
    question: "How do I book a Chitwan jungle safari?",
    answer:
      "Browse safari and activity operators on Sauraha Nepal, compare listings, and contact providers directly via WhatsApp or phone.",
  },
  {
    question: "Where can I find hotels in Sauraha?",
    answer:
      "Use our Stay category or the homepage map to discover hotels, resorts, guesthouses, and homestays in Sauraha.",
  },
  {
    question: "Do I need a permit for Chitwan National Park?",
    answer:
      "Yes — park entry permits are required. See our travel guides for community forest vs national park permit details.",
  },
]

type HomeJsonLdProps = {
  featuredListings: BusinessListing[]
  blogCount: number
}

export default function HomeJsonLd({ featuredListings, blogCount }: HomeJsonLdProps) {
  const destination = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Sauraha & Chitwan National Park",
    description:
      "Discover Sauraha — Nepal's gateway to Chitwan National Park. Hotels, jungle safaris, restaurants, and travel guides.",
    url: SITE,
    containedInPlace: {
      "@type": "Place",
      name: "Chitwan District",
      address: { "@type": "PostalAddress", addressCountry: "NP" },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.5833,
      longitude: 84.5,
    },
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const businesses = featuredListings.slice(0, 6).map((listing) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name,
    description: listing.description ?? undefined,
    image: getListingImage(listing),
    url: `${SITE}/listings/${listing.id}`,
    address: listing.address
      ? {
          "@type": "PostalAddress",
          streetAddress: listing.address,
          addressLocality: "Sauraha",
          addressCountry: "NP",
        }
      : undefined,
    telephone: listing.phone ?? undefined,
  }))

  const blogListing =
    blogCount > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Sauraha travel guides",
          numberOfItems: blogCount,
          itemListElement: {
            "@type": "ListItem",
            position: 1,
            item: {
              "@type": "Article",
              headline: "Chitwan travel guides",
              url: `${SITE}/blog`,
            },
          },
        }
      : null

  const graphs = [destination, faqPage, ...businesses, blogListing].filter(Boolean)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs) }}
    />
  )
}
