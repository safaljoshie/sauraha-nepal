"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import type { CategoryCatalog } from "@/lib/category-catalog"
import { buildMapFilterGroups, listingsForMapFilter } from "@/lib/homepage-data"
import type { ListingCoordinateMap } from "@/lib/map-coordinates"
import type { CategoryGroupId } from "@/lib/listings-catalog"
import { listingsToMapMarkers } from "@/lib/map-markers"

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
      Loading map...
    </div>
  ),
})

type MapFilterId = CategoryGroupId | "medical" | "all"

export default function HomeMapSection({
  listings,
  catalog,
  mapCoordinates,
}: {
  listings: BusinessListing[]
  catalog: CategoryCatalog
  mapCoordinates: ListingCoordinateMap
}) {
  const [filter, setFilter] = useState<MapFilterId>("all")
  const mapFilters = useMemo(() => buildMapFilterGroups(catalog), [catalog])

  const filtered = useMemo(
    () => listingsForMapFilter(listings, filter, catalog),
    [listings, filter, catalog],
  )

  const { onMap, withoutCoords } = useMemo(
    () => listingsToMapMarkers(filtered, mapCoordinates),
    [filtered, mapCoordinates],
  )

  return (
    <section id="map" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <h2 className="nsw-section-title">Find on the map</h2>
            <p className="mt-4 max-w-xl text-ink-muted">
              Explore hotels, restaurants, activities and services across Sauraha.
            </p>
          </div>
          <Link href="/listings" className="nsw-view-all shrink-0">
            Trip planner &amp; listings
          </Link>
        </div>
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Map filters"
        >
          {mapFilters.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={filter === group.id}
              onClick={() => setFilter(group.id as MapFilterId)}
              className={`rounded-xl px-4 py-2 text-sm font-bold tracking-wide uppercase transition-colors ${
                filter === group.id
                  ? "bg-green-brand text-white"
                  : "bg-surface-muted text-ink-muted hover:bg-black/5 hover:text-ink"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-black/8">
          <p className="mb-4 px-1 text-sm text-text-light">
            {onMap.length} listing{onMap.length === 1 ? "" : "s"} shown on map
            {withoutCoords > 0 &&
              ` (${withoutCoords} need a Google Maps link with coordinates to appear)`}
          </p>
          <MapComponent listings={onMap} />
        </div>
      </div>
    </section>
  )
}
