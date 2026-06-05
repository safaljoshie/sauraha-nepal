import type { BusinessListing } from "@/lib/business-listing"
import { getMapCoordinates, parseCoordinates, type MapCoordinates } from "@/lib/google-maps"

export type ListingCoordinateMap = Record<string, MapCoordinates>

/** Resolve map pins for all listings (sync parse + server fetch for short goo.gl links). */
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

  return map
}
