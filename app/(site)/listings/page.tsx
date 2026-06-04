import type { Metadata } from "next"
import ListingsExplorer from "@/components/listings/ListingsExplorer"
import PageHeader from "@/components/PageHeader"
import { fetchCategoryCatalog } from "@/lib/category-catalog"
import { parseCategoryParam } from "@/lib/listings-catalog"
import { fetchApprovedListings } from "@/lib/listings-fetch"
import { pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "All Listings",
  description:
    "Browse approved hotels, restaurants, activities, and services in Sauraha, Nepal.",
  path: "/listings",
})

type ListingsPageProps = {
  searchParams: Promise<{ search?: string; category?: string; q?: string }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const [listings, catalog] = await Promise.all([
    fetchApprovedListings(),
    fetchCategoryCatalog(),
  ])
  const initialSearch = (params.search ?? params.q ?? "").trim()
  const initialCategory = parseCategoryParam(params.category, catalog)

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
        initialSearch={initialSearch}
        initialCategory={initialCategory}
      />
    </main>
  )
}
