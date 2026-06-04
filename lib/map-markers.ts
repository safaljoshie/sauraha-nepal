import type { BusinessListing } from "@/lib/business-listing"
import { parseCoordinates } from "@/lib/google-maps"

export type MapListingMarker = {
  id: string
  business_name: string
  category: string
  lat: number
  lng: number
}

export function listingsToMapMarkers(listings: BusinessListing[]) {
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
}
