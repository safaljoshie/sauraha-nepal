export type MapCoordinates = { lat: number; lng: number }

const NOMINATIM_USER_AGENT =
  "Mozilla/5.0 (compatible; SaurahaNepal/1.0; +https://www.saurahanepal.com)"

/** Rough Sauraha / Ratnanagar bounds — rejects geocoder matches outside the valley. */
const SAURAHA_BBOX = {
  minLat: 27.54,
  maxLat: 27.62,
  minLng: 84.42,
  maxLng: 84.53,
}

function isInSaurahaArea(coords: MapCoordinates) {
  return (
    coords.lat >= SAURAHA_BBOX.minLat &&
    coords.lat <= SAURAHA_BBOX.maxLat &&
    coords.lng >= SAURAHA_BBOX.minLng &&
    coords.lng <= SAURAHA_BBOX.maxLng
  )
}

function parseLatLng(lat: string, lng: string): MapCoordinates | null {
  const latN = Number.parseFloat(lat)
  const lngN = Number.parseFloat(lng)
  if (Number.isFinite(latN) && Number.isFinite(lngN)) return { lat: latN, lng: lngN }
  return null
}

function parseCoordPair(value: string): MapCoordinates | null {
  const coordMatch = value.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
  if (!coordMatch) return null
  return parseLatLng(coordMatch[1], coordMatch[2])
}

/** Normalize saved links (protocol, Google redirect wrappers) before parsing. */
export function normalizeGoogleMapsLink(link: string): string {
  let trimmed = link.trim()
  if (!trimmed) return trimmed

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`
  }

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes("google.") && url.pathname === "/url") {
      const inner = url.searchParams.get("url")
      if (inner) {
        const decoded = decodeURIComponent(inner)
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded
        if (decoded.startsWith("/")) return `https://www.google.com${decoded}`
      }
    }
  } catch {
    return trimmed
  }

  return trimmed
}

function parseCoordinatesFromUrl(url: URL): MapCoordinates | null {
  const q = url.searchParams.get("q") || url.searchParams.get("query")
  if (q) {
    const coords = parseCoordPair(q)
    if (coords) return coords
  }

  for (const key of ["ll", "saddr", "daddr", "center"] as const) {
    const value = url.searchParams.get(key)
    if (value) {
      const coords = parseCoordPair(value)
      if (coords) return coords
    }
  }

  return null
}

/** Extract coordinates from a Google Maps URL string (no network). */
export function parseCoordinates(link: string): MapCoordinates | null {
  const trimmed = normalizeGoogleMapsLink(link)
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
    const coords = parseCoordinatesFromUrl(new URL(trimmed))
    if (coords) return coords
  } catch {
    return null
  }

  return null
}

/** Place name from a Maps URL when coordinates are not embedded. */
export function extractPlaceQueryFromLink(link: string): string | null {
  const trimmed = normalizeGoogleMapsLink(link)
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const q = url.searchParams.get("q") || url.searchParams.get("query")
    if (q && !parseCoordPair(q)) {
      return decodeURIComponent(q.replace(/\+/g, " ")).trim() || null
    }

    const placePath = url.pathname.match(/\/maps\/place\/([^/]+)/)
    if (placePath) {
      return decodeURIComponent(placePath[1].replace(/\+/g, " ")).trim() || null
    }
  } catch {
    return null
  }

  return null
}

export function isShortGoogleMapsLink(link: string) {
  const trimmed = normalizeGoogleMapsLink(link)
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

function needsRedirectResolve(link: string) {
  try {
    const url = new URL(normalizeGoogleMapsLink(link))
    return url.hostname.includes("google.") && url.pathname === "/url"
  } catch {
    return false
  }
}

/** Follow redirects and return the final Google Maps URL (server-side). */
export async function resolveGoogleMapsUrl(link: string): Promise<string> {
  const trimmed = normalizeGoogleMapsLink(link)
  const res = await fetch(trimmed, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
    },
    signal: AbortSignal.timeout(8000),
  })
  return res.url || trimmed
}

/** Geocode a place name or address for map pins (server-side, Nepal-biased). */
export async function geocodePlaceQuery(query: string): Promise<MapCoordinates | null> {
  const q = query.trim()
  if (!q) return null

  const nominatim = await geocodeWithNominatim(q)
  if (nominatim) return nominatim

  return geocodeWithPhoton(q)
}

async function geocodeWithNominatim(query: string): Promise<MapCoordinates | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "1")
  url.searchParams.set("viewbox", "84.53,27.62,84.42,27.54")
  url.searchParams.set("bounded", "1")

  const res = await fetch(url, {
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 86400 },
  })

  if (!res.ok) return null

  const data: unknown = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const first = data[0] as { lat?: string; lon?: string }
  const lat = Number.parseFloat(first.lat ?? "")
  const lng = Number.parseFloat(first.lon ?? "")
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const coords = { lat, lng }
  return isInSaurahaArea(coords) ? coords : null
}

async function geocodeWithPhoton(query: string): Promise<MapCoordinates | null> {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", query)
  url.searchParams.set("limit", "3")
  url.searchParams.set(
    "bbox",
    `${SAURAHA_BBOX.minLng},${SAURAHA_BBOX.minLat},${SAURAHA_BBOX.maxLng},${SAURAHA_BBOX.maxLat}`,
  )

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 86400 },
  })

  if (!res.ok) return null

  const data = (await res.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] }
      properties?: { name?: string }
    }>
  }

  for (const feature of data.features ?? []) {
    const coords = feature.geometry?.coordinates
    if (!coords || coords.length < 2) continue

    const lng = Number(coords[0])
    const lat = Number(coords[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

    const parsed = { lat, lng }
    if (isInSaurahaArea(parsed)) return parsed
  }

  return null
}

/** Parse coordinates from a link, resolving short goo.gl URLs when needed. */
export async function getMapCoordinates(link: string): Promise<MapCoordinates | null> {
  const normalized = normalizeGoogleMapsLink(link)
  if (!normalized) return null

  const direct = parseCoordinates(normalized)
  if (direct) return direct

  if (!isShortGoogleMapsLink(normalized) && !needsRedirectResolve(normalized)) return null

  try {
    const resolved = await resolveGoogleMapsUrl(normalized)
    return parseCoordinates(resolved)
  } catch {
    return null
  }
}

export function getGoogleMapsEmbedUrl(link: string): string | null {
  const trimmed = normalizeGoogleMapsLink(link)
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
