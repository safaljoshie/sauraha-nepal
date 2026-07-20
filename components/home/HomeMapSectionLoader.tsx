import DeferredMount from "@/components/DeferredMount"
import HomeMapSection from "@/components/home/HomeMapSection"
import type { BusinessListingSummary } from "@/lib/business-listing"
import type { CategoryCatalog } from "@/lib/category-catalog"
import { coordinateMapFromListings } from "@/lib/map-coordinates"

function HomeMapSectionSkeleton() {
  return (
    <section id="map" className="home-section scroll-mt-24" aria-busy="true" aria-label="Loading map">
      <div className="site-container">
        <div className="mb-10 h-8 w-48 animate-pulse rounded-2xl bg-gray-200 md:mb-12" />
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </section>
  )
}

export default function HomeMapSectionLoader({
  listings,
  catalog,
}: {
  listings: BusinessListingSummary[]
  catalog: CategoryCatalog
}) {
  // Coordinates come straight off the rows now, so there is no async work left
  // to suspend on — DeferredMount alone still keeps the map off the critical path.
  return (
    <DeferredMount fallback={<HomeMapSectionSkeleton />}>
      <HomeMapSection
        listings={listings}
        catalog={catalog}
        mapCoordinates={coordinateMapFromListings(listings)}
      />
    </DeferredMount>
  )
}
