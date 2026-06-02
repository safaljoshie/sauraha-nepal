"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import { getCategoryDisplay, searchListings } from "@/lib/listings-catalog"

type HeroSearchProps = {
  listings: BusinessListing[]
}

export default function HeroSearch({ listings }: HeroSearchProps) {
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
    <div ref={containerRef} className="relative mx-auto mb-8 max-w-[560px]">
      <form
        onSubmit={handleSubmit}
        className="flex overflow-hidden rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
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
          className="flex-1 border-none bg-transparent px-6 py-4 font-[family-name:var(--font-nunito)] text-base text-text-brand outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="cursor-pointer bg-green-mid px-7 font-semibold text-white transition-colors hover:bg-green-brand"
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
