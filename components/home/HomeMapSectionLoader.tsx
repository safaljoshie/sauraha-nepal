import { Suspense } from "react"
import HomeMapSection from "@/components/home/HomeMapSection"
import type { BusinessListing } from "@/lib/business-listing"
import type { CategoryCatalog } from "@/lib/category-catalog"
import { buildListingCoordinateMap } from "@/lib/map-coordinates"

function HomeMapSectionSkeleton() {
  return (
    <section id="map" className="home-section scroll-mt-24" aria-busy="true" aria-label="Loading map">
      <div className="mx-auto max-w-[1400px]">
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

async function HomeMapSectionContent({
  listings,
  catalog,
}: {
  listings: BusinessListing[]
  catalog: CategoryCatalog
}) {
  const mapCoordinates = await buildListingCoordinateMap(listings)
  return (
    <HomeMapSection
      listings={listings}
      catalog={catalog}
      mapCoordinates={mapCoordinates}
    />
  )
}

export default function HomeMapSectionLoader({
  listings,
  catalog,
}: {
  listings: BusinessListing[]
  catalog: CategoryCatalog
}) {
  return (
    <Suspense fallback={<HomeMapSectionSkeleton />}>
      <HomeMapSectionContent listings={listings} catalog={catalog} />
    </Suspense>
  )
}
