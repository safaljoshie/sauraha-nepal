"use client"

import dynamic from "next/dynamic"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { HeroSearchListing } from "@/lib/listings-catalog"

const HomeDestinationSearch = dynamic(
  () => import("@/components/home/HomeDestinationSearch"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-11 w-full max-w-2xl animate-pulse rounded-xl bg-white/20 md:h-[52px] md:rounded-2xl"
        aria-hidden
      />
    ),
  },
)

type HomeHeroSearchSlotProps = {
  searchListings: HeroSearchListing[]
  searchCategories: CategoryCatalog
}

export default function HomeHeroSearchSlot({
  searchListings,
  searchCategories,
}: HomeHeroSearchSlotProps) {
  return (
    <HomeDestinationSearch
      searchListings={searchListings}
      searchCategories={searchCategories}
    />
  )
}
