import type { Metadata } from "next"
import ListingsExplorer from "@/components/listings/ListingsExplorer"
import PageHeader from "@/components/PageHeader"
import { fetchCategoryCatalog } from "@/lib/category-catalog"
import { parseCategoryParam } from "@/lib/listings-catalog"
import { buildListingCoordinateMap } from "@/lib/map-coordinates"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: "All Listings",
  description:
    "Browse approved hotels, restaurants, activities, and services in Sauraha, Nepal.",
  path: "/listings",
})

type ListingsPageProps = {
  searchParams: Promise<{ search?: string; category?: string; q?: string; view?: string }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const [listings, catalog] = await Promise.all([
    fetchApprovedListings(),
    fetchCategoryCatalog(),
  ])
  const mapCoordinates = await buildListingCoordinateMap(listings)
  const searchParam = params.search?.trim() ?? ""
  const initialSearch =
    searchParam && searchParam !== "true" ? searchParam : (params.q ?? "").trim()
  const initialCategory = parseCategoryParam(params.category, catalog)
  const initialViewMode = params.view === "map" ? "map" : "grid"
  const focusSearchOnMount = searchParam === "true"

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
        initialSearch={initialSearch}
        initialCategory={initialCategory}
        initialViewMode={initialViewMode}
        focusSearchOnMount={focusSearchOnMount}
      />
    </main>
  )
}
