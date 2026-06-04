"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import type { MapListingMarker } from "@/lib/map-markers"
import { getCategoryDisplay } from "@/lib/listings-catalog"
import "leaflet/dist/leaflet.css"

const SAURAHA_CENTER: [number, number] = [27.5833, 84.5]
const DEFAULT_ZOOM = 14

function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  })
}

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

export default function Map({ listings }: { listings: MapListingMarker[] }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fixLeafletIcons()
    setReady(true)
  }, [])

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    [],
  )

  if (!ready) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        Loading map...
      </div>
    )
  }

  return (
    <div className="h-[min(70vh,520px)] min-h-96 overflow-hidden rounded-2xl border border-border-brand">
      <MapContainer
        center={SAURAHA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds listings={listings} />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div className="min-w-[140px] text-sm">
                <p className="font-semibold text-green-brand">{listing.business_name}</p>
                <p className="text-text-mid">{getCategoryDisplay(listing.category)}</p>
                <Link
                  href={`/listings/${listing.id}`}
                  className="mt-2 inline-block font-semibold text-orange-brand hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
