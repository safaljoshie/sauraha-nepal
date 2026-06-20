"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { BusinessListing } from "@/lib/business-listing"
import type { ListingCoordinateMap } from "@/lib/map-coordinates"
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
import ListingsMapView from "./ListingsMapView"

type ViewMode = "grid" | "map"

type ListingsExplorerProps = {
  listings: BusinessListing[]
  catalog: CategoryCatalog
  mapCoordinates: ListingCoordinateMap
  initialSearch?: string
  initialCategory?: CategoryGroupId
  initialViewMode?: ViewMode
  focusSearchOnMount?: boolean
}

export default function ListingsExplorer({
  listings,
  catalog,
  mapCoordinates,
  initialSearch = "",
  initialCategory = "all",
  initialViewMode = "grid",
  focusSearchOnMount = false,
}: ListingsExplorerProps) {
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [category, setCategory] = useState<CategoryGroupId>(initialCategory)
  const [planFilter, setPlanFilter] = useState<PlanFilterId>("all")
  const [sort, setSort] = useState<SortOptionId>("plan")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const gridTopRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setViewMode(initialViewMode)
  }, [initialViewMode])

  useEffect(() => {
    setSearchInput(initialSearch)
    setDebouncedSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    if (!focusSearchOnMount) return
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [focusSearchOnMount])

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
    setCurrentPage(1)
  }, [debouncedSearch, category, planFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage)
  }, [currentPage, safePage])

  const pageListings = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  function goToPage(page: number) {
    const next = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(next)
    window.requestAnimationFrame(() => {
      gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const totalApproved = listings.length

  function clearSearch() {
    setSearchInput("")
    setDebouncedSearch("")
  }

  return (
    <>
      <div className="sticky top-[68px] z-[90] border-b border-border-brand bg-white py-5">
        <div className="site-container flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search listings..."
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

      <div className="site-container pt-8">
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

        <div ref={gridTopRef} className="mt-8 mb-6 flex scroll-mt-28 flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-text-light">
            {totalApproved === 0
              ? "No approved listings yet"
              : viewMode === "map"
                ? `Showing ${filtered.length} listing${filtered.length === 1 ? "" : "s"}`
                : filtered.length === 0
                  ? "No listings match your filters"
                  : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} listing${filtered.length === 1 ? "" : "s"}`}
            {filtered.length !== totalApproved && filtered.length > 0 && ` (filtered from ${totalApproved})`}
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
            <ListingsMapView listings={filtered} mapCoordinates={mapCoordinates} />
          </div>
        ) : (
          <ListingsGridErrorBoundary>
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageListings.map((listing) => (
                <BusinessListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <ListingsPagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </ListingsGridErrorBoundary>
        )}
      </div>
    </>
  )
}

function getPaginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: (number | "ellipsis")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push("ellipsis")
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < total - 1) items.push("ellipsis")
  items.push(total)

  return items
}

function ListingsPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return <div className="pb-16" />
  }

  const items = getPaginationItems(page, totalPages)

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 pb-16"
      aria-label="Listings pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-brand hover:text-green-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-text-light" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`min-w-10 cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
              item === page
                ? "border-green-brand bg-green-brand text-white"
                : "border-border-brand bg-white text-text-mid hover:border-green-brand hover:text-green-brand"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-brand hover:text-green-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
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
