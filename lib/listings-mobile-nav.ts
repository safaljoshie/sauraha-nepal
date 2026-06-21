export const LISTINGS_NAV_EVENT = "sauraha:listings-nav"

export type ListingsNavMode = "explore" | "map" | "search"

export type ListingsNavDetail = {
  mode: ListingsNavMode
}

export function buildListingsNavUrl(mode: ListingsNavMode) {
  const url = new URL("/listings", window.location.origin)
  if (mode === "map") {
    url.searchParams.set("view", "map")
  } else if (mode === "search") {
    url.searchParams.set("search", "true")
  }
  return url.pathname + url.search
}

export function dispatchListingsNav(detail: ListingsNavDetail) {
  window.dispatchEvent(new CustomEvent<ListingsNavDetail>(LISTINGS_NAV_EVENT, { detail }))
}

export function pushListingsNav(mode: ListingsNavMode) {
  const href = buildListingsNavUrl(mode)
  window.history.pushState(null, "", href)
  dispatchListingsNav({ mode })
}

export function parseListingsNavMode(search: string): ListingsNavMode {
  const params = new URLSearchParams(search)
  if (params.get("view") === "map") return "map"
  if (params.get("search") === "true") return "search"
  return "explore"
}
