"use client"

import { useEffect, useState } from "react"

export default function StickySearchFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <a
      href="#hero-search"
      className="fixed bottom-20 right-[4.25rem] z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-green-brand text-white shadow-lg transition-transform hover:scale-105 md:right-[4.75rem] md:bottom-6"
      aria-label="Search destinations"
    >
      <span className="text-lg" aria-hidden>
        🔍
      </span>
    </a>
  )
}
