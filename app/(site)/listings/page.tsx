import type { Metadata } from "next"
import ListingsExplorer from "@/components/listings/ListingsExplorer"
import PageHeader from "@/components/PageHeader"
import { fetchCategoryCatalog } from "@/lib/category-catalog"
import { coordinateMapFromListings } from "@/lib/map-coordinates"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { buildListingsIndexMetadata } from "@/lib/seo"

export const metadata = {
  title: "Sauraha Hotels, Restaurants & Tours | Browse Verified Local Listings",
  description: "Discover 76+ verified hotels, lodges, restaurants, tour operators and activities in Sauraha, gateway to Chitwan National Park, Nepal.",
  openGraph: {
    title: "Browse Hotels, Restaurants & Tours in Sauraha, Nepal | Sauraha Nepal",
    description: "Discover 76+ verified hotels, lodges, restaurants, tour operators and activities in Sauraha, gateway to Chitwan National Park, Nepal.",
    url: "https://www.saurahanepal.com/listings",
    siteName: "Sauraha Nepal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Hotels, Restaurants & Tours in Sauraha, Nepal | Sauraha Nepal",
    description: "Discover 76+ verified hotels, lodges, restaurants, tour operators and activities in Sauraha, gateway to Chitwan National Park, Nepal.",
  },
  alternates: {
    canonical: "https://www.saurahanepal.com/listings",
  },
}

export default async function ListingsPage() {
  const [listings, catalog] = await Promise.all([
    fetchApprovedListings(),
    fetchCategoryCatalog(),
  ])
  const mapCoordinates = coordinateMapFromListings(listings)

  return (
    <main>
      <PageHeader
        label="Explore Sauraha"
        title="All Listings"
        subtitle={
          listings.length > 0
            ? `${listings.length} business${listings.length === 1 ? "" : "es"}, activities & services in Sauraha`
            : "Discover businesses in Sauraha"
        }
      />
      <ListingsExplorer
        listings={listings}
        catalog={catalog}
        mapCoordinates={mapCoordinates}
      />
    </main>
  )
}
