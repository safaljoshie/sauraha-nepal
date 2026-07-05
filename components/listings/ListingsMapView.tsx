"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import type { ListingCoordinateMap } from "@/lib/map-coordinates"
import { formatMapCoverageNote, listingsToMapMarkers } from "@/lib/map-markers"

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
      Loading map...
    </div>
  ),
})

export default function ListingsMapView({
  listings,
  mapCoordinates,
}: {
  listings: BusinessListing[]
  mapCoordinates: ListingCoordinateMap
}) {
  const mapCoverage = useMemo(
    () => listingsToMapMarkers(listings, mapCoordinates),
    [listings, mapCoordinates],
  )
  const { onMap } = mapCoverage

  return (
    <div>
      <p className="mb-4 text-sm text-text-light">
        {formatMapCoverageNote(mapCoverage)}
      </p>
      <MapComponent listings={onMap} />
    </div>
  )
}
