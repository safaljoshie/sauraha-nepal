"use client"

import dynamic from "next/dynamic"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { BusinessListing } from "@/lib/business-listing"

const HomeDestinationSearch = dynamic(
  () => import("@/components/home/HomeDestinationSearch"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[52px] w-full max-w-2xl animate-pulse rounded-xl bg-white/20"
        aria-hidden
      />
    ),
  },
)

type HomeHeroSearchSlotProps = {
  listings: BusinessListing[]
  searchCategories: CategoryCatalog
}

export default function HomeHeroSearchSlot({
  listings,
  searchCategories,
}: HomeHeroSearchSlotProps) {
  return (
    <HomeDestinationSearch listings={listings} searchCategories={searchCategories} />
  )
}
