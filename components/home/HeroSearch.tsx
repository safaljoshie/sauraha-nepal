"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { getCategoryDisplay, searchListings, type HeroSearchListing } from "@/lib/listings-catalog"
import { heroSearchButtonCompact, heroSearchInputCompact } from "@/lib/hero-cta-classes"

type HeroSearchProps = {
  listings: HeroSearchListing[]
  variant?: "hero" | "default"
}

export default function HeroSearch({ listings, variant = "default" }: HeroSearchProps) {
  const isHero = variant === "hero"
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const suggestions = useMemo(
    () => searchListings(listings, debouncedQuery, 6),
    [listings, debouncedQuery],
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setOpen(false)
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/listings?search=${encodeURIComponent(trimmed)}`)
    } else {
      router.push("/listings")
    }
  }

  const showDropdown = open && debouncedQuery.trim().length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex items-stretch overflow-hidden bg-white ${
          isHero
            ? "min-h-[44px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] md:rounded-2xl"
            : "mx-auto max-w-[600px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        }`}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search hotels, restaurants, activities..."
          className={
            isHero
              ? heroSearchInputCompact
              : "flex-1 border-none bg-transparent px-5 py-4 text-base text-ink outline-none md:px-6"
          }
          autoComplete="off"
        />
        <button
          type="submit"
          className={
            isHero
              ? heroSearchButtonCompact
              : "cursor-pointer bg-green-brand px-6 font-bold tracking-wide text-white uppercase transition-colors hover:bg-green-mid md:px-8"
          }
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border-brand bg-white text-left shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-light">No results found</p>
          ) : (
            <ul>
              {suggestions.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/listings/${listing.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-green-mid/10"
                  >
                    <p className="font-semibold text-text-brand">{listing.business_name}</p>
                    <p className="text-xs text-green-mid">
                      {getCategoryDisplay(listing.category)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-light">
                      {listing.address ?? "Sauraha, Nepal"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
