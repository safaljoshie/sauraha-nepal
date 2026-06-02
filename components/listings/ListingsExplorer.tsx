"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import {
  CATEGORY_GROUPS,
  countByCategoryGroup,
  filterListings,
  PAGE_SIZE,
  type CategoryGroupId,
  type PlanFilterId,
  type SortOptionId,
} from "@/lib/listings-catalog"
import BusinessListingCard from "./BusinessListingCard"

type ListingsExplorerProps = {
  listings: BusinessListing[]
}

export default function ListingsExplorer({ listings }: ListingsExplorerProps) {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState<CategoryGroupId>("all")
  const [planFilter, setPlanFilter] = useState<PlanFilterId>("all")
  const [sort, setSort] = useState<SortOptionId>("plan")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filtered = useMemo(
    () =>
      filterListings(listings, {
        search: debouncedSearch,
        category,
        plan: planFilter,
        sort,
      }),
    [listings, debouncedSearch, category, planFilter, sort],
  )

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearch, category, planFilter, sort])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    window.setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
      setLoadingMore(false)
    }, 400)
  }, [filtered.length, hasMore, loadingMore])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "120px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const totalApproved = listings.length
  const showingCount = visible.length

  function clearSearch() {
    setSearchInput("")
    setDebouncedSearch("")
  }

  return (
    <>
      <div className="sticky top-[68px] z-[90] border-b border-border-brand bg-white px-4 py-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              placeholder="🔍 Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-w-0 flex-1 rounded-full border-[1.5px] border-border-brand px-4 py-2.5 text-sm outline-none focus:border-green-mid sm:min-w-[200px]"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as PlanFilterId)}
              className="rounded-full border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
              aria-label="Filter by plan"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="featured">Featured</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOptionId)}
              className="rounded-full border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
              aria-label="Sort listings"
            >
              <option value="plan">Plan (Premium first)</option>
              <option value="newest">Newest First</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_GROUPS.map((tab) => {
            const count = countByCategoryGroup(listings, tab.id)
            const active = category === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`cursor-pointer rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-green-brand bg-green-brand text-white"
                    : "border-border-brand bg-white text-text-mid hover:border-green-brand hover:bg-green-brand hover:text-white"
                }`}
              >
                {tab.tabLabel}
                <span className={active ? "text-white/80" : "text-text-light"}>
                  {" "}
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-8 mb-6 text-sm text-text-light">
          {totalApproved === 0
            ? "No approved listings yet"
            : `Showing ${showingCount} of ${filtered.length} listing${filtered.length === 1 ? "" : "s"}`}
          {filtered.length !== totalApproved && ` (filtered from ${totalApproved})`}
        </p>

        {totalApproved === 0 ? (
          <EmptyAll />
        ) : filtered.length === 0 ? (
          <EmptyFiltered
            search={debouncedSearch}
            category={category}
            onClearSearch={clearSearch}
          />
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((listing) => (
                <BusinessListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div ref={sentinelRef} className="flex min-h-[48px] items-center justify-center pb-16">
              {loadingMore && (
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-green-brand/30 border-t-green-brand" />
              )}
              {!hasMore && filtered.length > 0 && (
                <p className="text-sm font-medium text-text-light">No more listings</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function EmptyAll() {
  return (
    <div className="mb-16 rounded-2xl border border-border-brand bg-white px-8 py-16 text-center">
      <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
        No listings yet — be the first to list your business!
      </p>
      <Link href="/list-your-business" className="btn-primary mt-6 inline-block px-8 py-3">
        List Your Business
      </Link>
    </div>
  )
}

function EmptyFiltered({
  search,
  category,
  onClearSearch,
}: {
  search: string
  category: CategoryGroupId
  onClearSearch: () => void
}) {
  if (search) {
    return (
      <div className="mb-16 rounded-2xl border border-border-brand bg-white px-8 py-16 text-center">
        <p className="text-lg text-text-mid">
          No listings found for &lsquo;{search}&rsquo;
        </p>
        <button
          type="button"
          onClick={onClearSearch}
          className="btn-primary mt-6 cursor-pointer px-8 py-3"
        >
          Clear search
        </button>
      </div>
    )
  }

  const group = CATEGORY_GROUPS.find((g) => g.id === category)
  return (
    <div className="mb-16 rounded-2xl border border-border-brand bg-white px-8 py-16 text-center">
      <p className="text-lg text-text-mid">
        No listings in {group?.label ?? "this category"} yet
      </p>
      <Link href="/listings" className="btn-primary mt-6 inline-block px-8 py-3">
        View all listings
      </Link>
    </div>
  )
}
