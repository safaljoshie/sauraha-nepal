import ListingsExplorer from "@/components/listings/ListingsExplorer"
import PageHeader from "@/components/PageHeader"
import { fetchApprovedListings } from "@/lib/listings-fetch"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "All Listings",
  description:
    "Browse approved hotels, restaurants, activities, and services in Sauraha, Nepal.",
}

export default async function ListingsPage() {
  const listings = await fetchApprovedListings()

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
      <ListingsExplorer listings={listings} />
    </main>
  )
}
