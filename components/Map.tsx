"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import type { Icon } from "leaflet"
import { getCategoryDisplay } from "@/lib/listings-catalog"
import "leaflet/dist/leaflet.css"

export type MapListingMarker = {
  id: string
  business_name: string
  category: string
  lat: number
  lng: number
}

const SAURAHA_CENTER: [number, number] = [27.5833, 84.5]
const DEFAULT_ZOOM = 14

function FitBounds({ listings }: { listings: MapListingMarker[] }) {
  const map = useMap()

  useEffect(() => {
    let cancelled = false

    void import("leaflet").then(({ default: L }) => {
      if (cancelled) return

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
    })

    return () => {
      cancelled = true
    }
  }, [listings, map])

  return null
}

export default function Map({ listings }: { listings: MapListingMarker[] }) {
  const [mounted, setMounted] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<Icon | null>(null)

  useEffect(() => {
    setMounted(true)

    void import("leaflet").then(({ default: L }) => {
      setMarkerIcon(
        L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      )
    })
  }, [])

  if (!mounted || !markerIcon) {
    return (
      <div
        className="flex h-[min(70vh,520px)] items-center justify-center bg-surface-muted text-ink-muted"
        role="status"
        aria-label="Loading map"
      >
        <span className="animate-pulse">Loading map…</span>
      </div>
    )
  }

  return (
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
