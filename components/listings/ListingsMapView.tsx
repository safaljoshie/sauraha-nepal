"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import { listingsToMapMarkers } from "@/lib/map-markers"

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
      Loading map...
    </div>
  ),
})

export default function ListingsMapView({ listings }: { listings: BusinessListing[] }) {
  const { onMap, withoutCoords } = useMemo(() => listingsToMapMarkers(listings), [listings])

  return (
    <div>
      <p className="mb-4 text-sm text-text-light">
        {onMap.length} listing{onMap.length === 1 ? "" : "s"} shown on map
        {withoutCoords > 0 &&
          ` (${withoutCoords} need a Google Maps link with coordinates to appear)`}
      </p>
      <MapComponent listings={onMap} />
    </div>
  )
}
