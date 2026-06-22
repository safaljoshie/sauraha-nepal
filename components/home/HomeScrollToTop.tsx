"use client"

import { useLayoutEffect } from "react"

/** Reset scroll on full load/refresh so the hero is always shown from the top. */
export default function HomeScrollToTop() {
  useLayoutEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    document.documentElement.classList.remove("nav-scrolled")

    return () => {
      history.scrollRestoration = previous
    }
  }, [])

  return null
}
