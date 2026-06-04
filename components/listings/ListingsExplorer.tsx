"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { BusinessListing } from "@/lib/business-listing"
import {
  countByCategoryGroup,
  filterListings,
  PAGE_SIZE,
  type CategoryGroupId,
  type PlanFilterId,
  type SortOptionId,
} from "@/lib/listings-catalog"
import BusinessListingCard from "./BusinessListingCard"
import ListingsGridErrorBoundary from "./ListingsGridErrorBoundary"

const ListingsMapView = dynamic(() => import("./ListingsMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,520px)] items-center justify-center rounded-2xl border border-border-brand bg-cream">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-green-brand/30 border-t-green-brand" />
    </div>
  ),
})

type ViewMode = "grid" | "map"

type ListingsExplorerProps = {
  listings: BusinessListing[]
  catalog: CategoryCatalog
  initialSearch?: string
  initialCategory?: CategoryGroupId
}

export default function ListingsExplorer({
  listings,
  catalog,
  initialSearch = "",
  initialCategory = "all",
}: ListingsExplorerProps) {
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [category, setCategory] = useState<CategoryGroupId>(initialCategory)
  const [planFilter, setPlanFilter] = useState<PlanFilterId>("all")
  const [sort, setSort] = useState<SortOptionId>("plan")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filtered = useMemo(
    () =>
      filterListings(
        listings,
        {
          search: debouncedSearch,
          category,
          plan: planFilter,
          sort,
        },
        catalog,
      ),
    [listings, debouncedSearch, category, planFilter, sort, catalog],
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
              className="min-w-0 flex-1 rounded-xl border-[1.5px] border-border-brand px-4 py-2.5 text-sm outline-none focus:border-green-mid sm:min-w-[200px]"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as PlanFilterId)}
              className="rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
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
              className="rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
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
          {catalog.builtGroups.map((tab) => {
            const count = countByCategoryGroup(listings, tab.id, catalog)
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

        <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-text-light">
            {totalApproved === 0
              ? "No approved listings yet"
              : `Showing ${viewMode === "map" ? filtered.length : showingCount} of ${filtered.length} listing${filtered.length === 1 ? "" : "s"}`}
            {filtered.length !== totalApproved && ` (filtered from ${totalApproved})`}
          </p>
          {filtered.length > 0 && (
            <div className="flex rounded-full border border-border-brand bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  viewMode === "grid"
                    ? "bg-green-brand text-white"
                    : "text-text-mid hover:text-green-brand"
                }`}
              >
                ⊞ Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  viewMode === "map"
                    ? "bg-green-brand text-white"
                    : "text-text-mid hover:text-green-brand"
                }`}
              >
                🗺 Map
              </button>
            </div>
          )}
        </div>

        {totalApproved === 0 ? (
          <EmptyAll />
        ) : filtered.length === 0 ? (
          <EmptyFiltered
            search={debouncedSearch}
            category={category}
            catalog={catalog}
            onClearSearch={clearSearch}
          />
        ) : viewMode === "map" ? (
          <div className="mb-16">
            <ListingsMapView listings={filtered} />
          </div>
        ) : (
          <ListingsGridErrorBoundary>
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
          </ListingsGridErrorBoundary>
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
  catalog,
  onClearSearch,
}: {
  search: string
  category: CategoryGroupId
  catalog: CategoryCatalog
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

  const group = catalog.builtGroups.find((g) => g.id === category)
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
