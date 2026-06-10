export type MapCoordinates = { lat: number; lng: number }

function parseLatLng(lat: string, lng: string): MapCoordinates | null {
  const latN = Number.parseFloat(lat)
  const lngN = Number.parseFloat(lng)
  if (Number.isFinite(latN) && Number.isFinite(lngN)) return { lat: latN, lng: lngN }
  return null
}

/** Extract coordinates from a Google Maps URL string (no network). */
export function parseCoordinates(link: string): MapCoordinates | null {
  const trimmed = link.trim()
  if (!trimmed) return null

  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch) {
    const coords = parseLatLng(atMatch[1], atMatch[2])
    if (coords) return coords
  }

  const dataMatch = trimmed.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (dataMatch) {
    const coords = parseLatLng(dataMatch[1], dataMatch[2])
    if (coords) return coords
  }

  try {
    const url = new URL(trimmed)
    const q = url.searchParams.get("q") || url.searchParams.get("query")
    if (q) {
      const coordMatch = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
      if (coordMatch) {
        const coords = parseLatLng(coordMatch[1], coordMatch[2])
        if (coords) return coords
      }
    }

    const ll = url.searchParams.get("ll")
    if (ll) {
      const llMatch = ll.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
      if (llMatch) {
        const coords = parseLatLng(llMatch[1], llMatch[2])
        if (coords) return coords
      }
    }
  } catch {
    return null
  }

  return null
}

export function isShortGoogleMapsLink(link: string) {
  const trimmed = link.trim()
  if (!trimmed) return false
  try {
    const host = new URL(trimmed).hostname.replace(/^www\./, "")
    return (
      host === "goo.gl" ||
      host === "maps.app.goo.gl" ||
      host === "g.co" ||
      host.endsWith(".goo.gl")
    )
  } catch {
    return /goo\.gl|g\.co\/maps/i.test(trimmed)
  }
}

/** Follow redirects and return the final Google Maps URL (server-side). */
export async function resolveGoogleMapsUrl(link: string): Promise<string> {
  const trimmed = link.trim()
  const res = await fetch(trimmed, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SaurahaNepal/1.0; +https://www.saurahanepal.com)",
    },
    signal: AbortSignal.timeout(8000),
  })
  return res.url || trimmed
}

/** Parse coordinates from a link, resolving short goo.gl URLs when needed. */
export async function getMapCoordinates(link: string): Promise<MapCoordinates | null> {
  const trimmed = link.trim()
  if (!trimmed) return null

  const direct = parseCoordinates(trimmed)
  if (direct) return direct

  if (!isShortGoogleMapsLink(trimmed)) return null

  try {
    const resolved = await resolveGoogleMapsUrl(trimmed)
    return parseCoordinates(resolved)
  } catch {
    return null
  }
}

export function getGoogleMapsEmbedUrl(link: string): string | null {
  const trimmed = link.trim()
  if (!trimmed) return null

  const coords = parseCoordinates(trimmed)
  if (coords) {
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}&output=embed`
  }

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "google.com" || host.endsWith(".google.com")) {
      const placePath = url.pathname.match(/\/maps\/place\/([^/]+)/)
      if (placePath) {
        const q = decodeURIComponent(placePath[1].replace(/\+/g, " "))
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
      }

      const q = url.searchParams.get("q") || url.searchParams.get("query")
      if (q) {
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
      }
    }
  } catch {
    return null
  }

  return null
}

/** URL to open a listing location in Google Maps (prefers saved link). */
export function googleMapsOpenUrl(
  lat: number,
  lng: number,
  mapsLink?: string | null,
): string {
  const saved = mapsLink?.trim()
  if (saved) return saved
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Best URL to open a listing in Google Maps (link, coords, or address search). */
export function getListingMapsOpenUrl(options: {
  mapsLink?: string | null
  address?: string | null
  coords?: MapCoordinates | null
}): string | null {
  const saved = options.mapsLink?.trim()
  if (saved) return saved

  if (options.coords) {
    return `https://www.google.com/maps/search/?api=1&query=${options.coords.lat},${options.coords.lng}`
  }

  const address = options.address?.trim()
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Sauraha, Nepal`)}`
  }

  return null
}
