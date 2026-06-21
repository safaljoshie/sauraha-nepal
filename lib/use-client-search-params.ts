"use client"

import { useCallback, useSyncExternalStore } from "react"
import { LISTINGS_NAV_EVENT } from "@/lib/listings-mobile-nav"

function getSearchParamString() {
  if (typeof window === "undefined") return ""
  return window.location.search
}

function subscribeToSearchParams(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  window.addEventListener(LISTINGS_NAV_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("popstate", onStoreChange)
    window.removeEventListener(LISTINGS_NAV_EVENT, onStoreChange)
  }
}

/** Client URL search string without Next.js useSearchParams (avoids Suspense stalls). */
export function useClientSearchParams() {
  const search = useSyncExternalStore(subscribeToSearchParams, getSearchParamString, () => "")

  const get = useCallback(
    (key: string) => {
      if (!search) return null
      return new URLSearchParams(search).get(key)
    },
    [search],
  )

  return { get, search }
}
