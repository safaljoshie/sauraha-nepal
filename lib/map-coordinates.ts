import type { BusinessListing } from "@/lib/business-listing"
import {
  extractPlaceQueryFromLink,
  geocodePlaceQuery,
  getMapCoordinates,
  normalizeGoogleMapsLink,
  parseCoordinates,
  resolveGoogleMapsUrl,
  type MapCoordinates,
} from "@/lib/google-maps"

export type ListingCoordinateMap = Record<string, MapCoordinates>

const GEOCODE_DELAY_MS = 1100

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocodeListingFallback(listing: BusinessListing): Promise<MapCoordinates | null> {
  const link = listing.google_maps_link?.trim()
  const queries: string[] = []

  if (link) {
    const normalized = normalizeGoogleMapsLink(link)
    const fromLink = extractPlaceQueryFromLink(normalized)
    if (fromLink) queries.push(fromLink)

    try {
      const resolved = await resolveGoogleMapsUrl(normalized)
      const fromResolved = extractPlaceQueryFromLink(resolved)
      if (fromResolved && !queries.includes(fromResolved)) queries.push(fromResolved)
    } catch {
      // Fall back to name/address geocoding below.
    }
  }

  const name = listing.business_name?.trim()
  if (name) {
    queries.push(`${name}, Ratnanagar, Chitwan, Nepal`)
    queries.push(`${name}, Sauraha, Nepal`)
  }

  const address = listing.address?.trim()
  if (address) {
    queries.push(`${address}, Sauraha, Nepal`)
    if (!queries.includes(address)) queries.push(address)
  }

  for (let i = 0; i < queries.length; i += 1) {
    const coords = await geocodePlaceQuery(queries[i])
    if (coords) return coords
    if (i < queries.length - 1) await sleep(GEOCODE_DELAY_MS)
  }

  return null
}

/** Resolve map pins for all listings (parse, short-link resolve, then geocode fallback). */
export async function buildListingCoordinateMap(
  listings: BusinessListing[],
): Promise<ListingCoordinateMap> {
  const map: ListingCoordinateMap = {}
  const needsResolve: BusinessListing[] = []

  for (const listing of listings) {
    const link = listing.google_maps_link?.trim()
    if (!link) continue

    const direct = parseCoordinates(link)
    if (direct) {
      map[listing.id] = direct
      continue
    }

    needsResolve.push(listing)
  }

  await Promise.all(
    needsResolve.map(async (listing) => {
      const link = listing.google_maps_link!.trim()
      const coords = await getMapCoordinates(link)
      if (coords) map[listing.id] = coords
    }),
  )

  const needsGeocode = needsResolve.filter((listing) => !map[listing.id])
  for (const listing of needsGeocode) {
    const coords = await geocodeListingFallback(listing)
    if (coords) map[listing.id] = coords
  }

  return map
}
