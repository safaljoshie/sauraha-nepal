"use client"

import Link from "next/link"
import HeroSearch from "@/components/home/HeroSearch"
import { buildSearchCategoryChips, type CategoryCatalog } from "@/lib/category-catalog"
import type { HeroSearchListing } from "@/lib/listings-catalog"

type HomeDestinationSearchProps = {
  searchListings: HeroSearchListing[]
  searchCategories: CategoryCatalog
}

export default function HomeDestinationSearch({
  searchListings,
  searchCategories,
}: HomeDestinationSearchProps) {
  const chips = buildSearchCategoryChips(searchCategories)

  return (
    <div id="hero-search" className="w-full scroll-mt-28">
      <HeroSearch listings={searchListings} variant="hero" />
      <div
        className="mt-3 flex flex-wrap gap-2"
        role="navigation"
        aria-label="Search by category"
      >
        {chips.map((cat) => (
          <Link
            key={cat.href}
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
