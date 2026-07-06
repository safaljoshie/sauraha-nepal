import type { BusinessListing } from "@/lib/business-listing"
import type { ListingCoordinateMap } from "@/lib/map-coordinates"
import { parseCoordinates } from "@/lib/google-maps"

export type MapListingMarker = {
  id: string
  slug: string | null
  business_name: string
  category: string
  lat: number
  lng: number
  mapsLink: string | null
}

export function listingsToMapMarkers(
  listings: BusinessListing[],
  coordinateMap?: ListingCoordinateMap,
) {
  const onMap: MapListingMarker[] = []
  let withoutLink = 0
  let unmappedWithLink = 0

  for (const listing of listings) {
    const link = listing.google_maps_link?.trim()
    if (!link) {
      withoutLink += 1
      continue
    }

    const cached = coordinateMap?.[listing.id]
    const coords = cached ?? parseCoordinates(link)
    if (!coords) {
      unmappedWithLink += 1
      continue
    }

    onMap.push({
      id: listing.id,
      slug: listing.slug,
      business_name: listing.business_name,
      category: listing.category,
      lat: coords.lat,
      lng: coords.lng,
      mapsLink: link,
    })
  }

  return {
    onMap,
    withoutLink,
    unmappedWithLink,
    withoutCoords: withoutLink + unmappedWithLink,
  }
}

export function formatMapCoverageNote(coverage: {
  onMap: MapListingMarker[]
  withoutLink: number
  unmappedWithLink: number
}) {
  const parts = [
    `${coverage.onMap.length} listing${coverage.onMap.length === 1 ? "" : "s"} shown on map`,
  ]

  if (coverage.withoutLink > 0) {
    parts.push(
      `${coverage.withoutLink} without a Google Maps link`,
    )
  }

  if (coverage.unmappedWithLink > 0) {
    parts.push(
      `${coverage.unmappedWithLink} have a map link we couldn't place as a pin yet`,
    )
  }

  if (parts.length === 1) return parts[0]

  return `${parts[0]} (${parts.slice(1).join("; ")})`
}
