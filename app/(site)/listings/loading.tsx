import ListingCardSkeleton from "@/components/listings/ListingCardSkeleton"
import PageHeader from "@/components/PageHeader"

export default function ListingsLoading() {
  return (
    <main>
      <PageHeader
        label="Explore Sauraha"
        title="All Listings"
        subtitle="Loading listings…"
      />
      <div className="site-container py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
