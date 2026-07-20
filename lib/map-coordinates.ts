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

/** Minimum shape the geocoder needs — keeps this usable from list views. */
type GeocodableListing = Pick<
  BusinessListing,
  "id" | "google_maps_link" | "business_name" | "address"
>

/** A row that already carries persisted coordinates. */
type LocatedListing = {
  id: string
  latitude?: number | null
  longitude?: number | null
}

/**
 * Build the pin map from coordinates already stored on each row.
 *
 * Synchronous and network-free — this is what pages should use.
 * `buildListingCoordinateMap` below does the actual geocoding and is reserved
 * for the offline backfill script.
 */
export function coordinateMapFromListings(
  listings: LocatedListing[],
): ListingCoordinateMap {
  const map: ListingCoordinateMap = {}
  for (const listing of listings) {
    const { latitude, longitude } = listing
    if (typeof latitude === "number" && typeof longitude === "number") {
      map[listing.id] = { lat: latitude, lng: longitude }
    }
  }
  return map
}

const GEOCODE_DELAY_MS = 1100

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocodeListingFallback(
  listing: GeocodableListing,
): Promise<MapCoordinates | null> {
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

/**
 * Resolve map pins by geocoding (parse, short-link resolve, then fallback).
 *
 * OFFLINE USE ONLY — scripts/backfill-listing-coordinates.ts. This makes
 * serial network calls with a 1.1s sleep between attempts to respect
 * Nominatim's usage policy, so a full run takes minutes. Pages must read
 * persisted coordinates via `coordinateMapFromListings` instead.
 */
export async function buildListingCoordinateMap(
  listings: GeocodableListing[],
): Promise<ListingCoordinateMap> {
  const map: ListingCoordinateMap = {}
  const needsResolve: GeocodableListing[] = []

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
