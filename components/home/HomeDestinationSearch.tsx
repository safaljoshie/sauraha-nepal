"use client"

import Link from "next/link"
import HeroSearch from "@/components/home/HeroSearch"
import { SEARCH_CATEGORIES } from "@/lib/homepage-constants"
import type { BusinessListing } from "@/lib/business-listing"

type HomeDestinationSearchProps = {
  listings: BusinessListing[]
}

export default function HomeDestinationSearch({ listings }: HomeDestinationSearchProps) {
  return (
    <div id="hero-search" className="w-full scroll-mt-28">
      <HeroSearch listings={listings} variant="hero" />
      <div
        className="mt-3 flex flex-wrap gap-2"
        role="navigation"
        aria-label="Search by category"
      >
        {SEARCH_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="rounded-lg border border-white/40 bg-black/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
