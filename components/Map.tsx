"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import { googleMapsOpenUrl } from "@/lib/google-maps"
import { createGreenMapPinIcon } from "@/lib/map-pin"
import type { MapListingMarker } from "@/lib/map-markers"
import { getCategoryDisplay } from "@/lib/listings-catalog"
import "leaflet/dist/leaflet.css"

const SAURAHA_CENTER: [number, number] = [27.5833, 84.5]
const DEFAULT_ZOOM = 14

const CARTO_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

function FitBounds({ listings }: { listings: MapListingMarker[] }) {
  const map = useMap()

  useEffect(() => {
    if (listings.length === 0) {
      map.setView(SAURAHA_CENTER, DEFAULT_ZOOM)
      return
    }
    if (listings.length === 1) {
      map.setView([listings[0].lat, listings[0].lng], DEFAULT_ZOOM)
      return
    }
    const bounds = L.latLngBounds(
      listings.map((l) => [l.lat, l.lng] as [number, number]),
    )
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [listings, map])

  return null
}

export default function Map({
  listings,
  embedded = false,
}: {
  listings: MapListingMarker[]
  embedded?: boolean
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const markerIcon = useMemo(() => createGreenMapPinIcon(), [])

  const shellClass = embedded
    ? "map-shell h-[min(70vh,520px)] min-h-96 w-full overflow-hidden"
    : "map-shell h-[min(70vh,520px)] min-h-96 overflow-hidden rounded-2xl border border-border-brand shadow-[0_8px_32px_rgba(26,92,42,0.08)]"

  if (!ready) {
    return (
      <div
        className={`flex h-96 items-center justify-center bg-gray-100 text-gray-500 ${embedded ? "" : "rounded-xl"}`}
      >
        Loading map...
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <MapContainer
        center={SAURAHA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_TILES} />
        <FitBounds listings={listings} />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={markerIcon}
          >
            <Popup className="map-listing-popup" closeButton>
              <div className="min-w-[168px] text-sm">
                <p className="font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand">
                  {listing.business_name}
                </p>
                <p className="mt-0.5 text-xs font-semibold tracking-wide text-green-mid uppercase">
                  {getCategoryDisplay(listing.category)}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-green-brand px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-mid"
                  >
                    View listing
                  </Link>
                  <a
                    href={googleMapsOpenUrl(listing.lat, listing.lng, listing.mapsLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-green-brand/25 bg-white px-3 py-2 text-xs font-semibold text-green-brand transition-colors hover:bg-cream"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
