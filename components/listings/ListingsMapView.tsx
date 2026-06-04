"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { MapListingMarker } from "@/components/Map"
import type { BusinessListing } from "@/lib/business-listing"
import { parseCoordinates } from "@/lib/google-maps"

const LeafletMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[min(70vh,520px)] items-center justify-center rounded-2xl border border-border-brand bg-surface-muted text-ink-muted"
      role="status"
      aria-label="Loading map"
    >
      <span className="animate-pulse">Loading map…</span>
    </div>
  ),
})

export default function ListingsMapView({ listings }: { listings: BusinessListing[] }) {
  const { onMap, withoutCoords } = useMemo(() => {
    const onMap: MapListingMarker[] = []
    let withoutCoords = 0

    for (const listing of listings) {
      const link = listing.google_maps_link?.trim()
      if (!link) {
        withoutCoords += 1
        continue
      }
      const coords = parseCoordinates(link)
      if (!coords) {
        withoutCoords += 1
        continue
      }
      onMap.push({
        id: listing.id,
        business_name: listing.business_name,
        category: listing.category,
        lat: coords.lat,
        lng: coords.lng,
      })
    }

    return { onMap, withoutCoords }
  }, [listings])

  return (
    <div>
      <p className="mb-4 text-sm text-text-light">
        {onMap.length} listing{onMap.length === 1 ? "" : "s"} shown on map
        {withoutCoords > 0 &&
          ` (${withoutCoords} need a Google Maps link with coordinates to appear)`}
      </p>
      <LeafletMap listings={onMap} />
    </div>
  )
}
