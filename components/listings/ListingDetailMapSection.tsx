"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { MapCoordinates } from "@/lib/google-maps"
import { getListingMapsOpenUrl } from "@/lib/google-maps"
import type { MapListingMarker } from "@/lib/map-markers"

const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
      Loading map...
    </div>
  ),
})

type ListingDetailMapSectionProps = {
  listingId: string
  businessName: string
  category: string
  address: string | null
  googleMapsLink: string | null
  coords: MapCoordinates | null
}

export default function ListingDetailMapSection({
  listingId,
  businessName,
  category,
  address,
  googleMapsLink,
  coords,
}: ListingDetailMapSectionProps) {
  const openUrl = getListingMapsOpenUrl({
    mapsLink: googleMapsLink,
    address,
    coords,
  })

  const markers = useMemo((): MapListingMarker[] => {
    if (!coords) return []
    return [
      {
        id: listingId,
        business_name: businessName,
        category,
        lat: coords.lat,
        lng: coords.lng,
        mapsLink: googleMapsLink,
      },
    ]
  }, [listingId, businessName, category, coords, googleMapsLink])

  if (!openUrl && !address?.trim()) return null

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
        Location
      </h2>
      {address?.trim() && (
        <p className="mt-2 text-sm text-text-mid">{address}</p>
      )}

      {markers.length > 0 ? (
        <div className="mt-4">
          <MapComponent listings={markers} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-light">
          Map pin unavailable — open in Google Maps using the address below.
        </p>
      )}

      {openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          Open in Google Maps
        </a>
      )}
    </section>
  )
}
