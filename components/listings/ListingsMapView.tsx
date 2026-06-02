"use client"

import Link from "next/link"
import { useEffect, useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import type { BusinessListing } from "@/lib/business-listing"
import { getCategoryDisplay } from "@/lib/listings-catalog"
import { parseCoordinates } from "@/lib/google-maps"
import "leaflet/dist/leaflet.css"

const SAURAHA_CENTER: [number, number] = [27.5833, 84.5]
const DEFAULT_ZOOM = 14

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type MapListing = BusinessListing & { lat: number; lng: number }

function FitBounds({ listings }: { listings: MapListing[] }) {
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
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [listings, map])

  return null
}

export default function ListingsMapView({ listings }: { listings: BusinessListing[] }) {
  const { onMap, withoutCoords } = useMemo(() => {
    const onMap: MapListing[] = []
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
      onMap.push({ ...listing, lat: coords.lat, lng: coords.lng })
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
      <div className="h-[min(70vh,520px)] overflow-hidden rounded-2xl border border-border-brand">
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
          <FitBounds listings={onMap} />
          {onMap.map((listing) => (
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
    </div>
  )
}
