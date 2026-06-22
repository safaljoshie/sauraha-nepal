"use client"

import Link from "next/link"
import HeroSearch from "@/components/home/HeroSearch"
import { buildSearchCategoryChips, type CategoryCatalog } from "@/lib/category-catalog"
import { heroSearchChipCompact } from "@/lib/hero-cta-classes"
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
        className="hero-category-chips mt-3 flex flex-nowrap items-stretch gap-1.5 md:flex-wrap md:gap-2"
        role="navigation"
        aria-label="Search by category"
      >
        {chips.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className={`hero-category-chip ${heroSearchChipCompact} border border-white/40 bg-black/25 font-bold tracking-wide text-white normal-case backdrop-blur-sm hover:bg-black/40 md:font-semibold md:uppercase`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
