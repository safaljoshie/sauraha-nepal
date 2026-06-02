export function parseCoordinates(link: string): { lat: number; lng: number } | null {
  const trimmed = link.trim()
  if (!trimmed) return null

  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch) {
    const lat = Number.parseFloat(atMatch[1])
    const lng = Number.parseFloat(atMatch[2])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  try {
    const url = new URL(trimmed)
    const q = url.searchParams.get("q") || url.searchParams.get("query")
    if (q) {
      const coordMatch = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
      if (coordMatch) {
        const lat = Number.parseFloat(coordMatch[1])
        const lng = Number.parseFloat(coordMatch[2])
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
      }
    }
  } catch {
    return null
  }

  return null
}

export function getGoogleMapsEmbedUrl(link: string): string | null {
  const trimmed = link.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "google.com" || host.endsWith(".google.com")) {
      const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (atMatch) {
        return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`
      }

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
