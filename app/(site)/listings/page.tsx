import ListingCard from "@/components/ListingCard"
import PageHeader from "@/components/PageHeader"
import { allListings, categoryTabs } from "@/lib/data"
import Link from "next/link"

export const metadata = {
  title: "All Listings",
}

export default function ListingsPage() {
  return (
    <main>
      <PageHeader
        label="Explore Sauraha"
        title="All Listings"
        subtitle="120+ businesses, activities & services in Sauraha"
      />

      <div className="sticky top-[68px] z-[90] border-b border-border-brand bg-white px-8 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <input
            type="search"
            placeholder="🔍 Search listings..."
            className="min-w-[200px] flex-1 rounded-full border-[1.5px] border-border-brand px-4 py-2.5 text-sm outline-none focus:border-green-mid"
          />
          <select className="rounded-full border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid">
            <option>All Categories</option>
            <option>Stay</option>
            <option>Eat & Drink</option>
            <option>Activities</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Tour Guides</option>
            <option>Travel Info</option>
          </select>
          <select className="rounded-full border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid">
            <option>Price Range</option>
            <option>$ Budget</option>
            <option>$$ Mid-range</option>
            <option>$$$ Premium</option>
          </select>
          <select className="rounded-full border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid">
            <option>Top Rated</option>
            <option>Newest</option>
            <option>A–Z</option>
          </select>
          <button type="button" className="btn-primary cursor-pointer">
            Search
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 pt-8">
        <div className="flex flex-wrap gap-2.5">
          {categoryTabs.map((tab, i) => (
            <Link
              key={tab.slug}
              href={`/listings?category=${tab.slug}`}
              className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                i === 0
                  ? "border-green-brand bg-green-brand text-white"
                  : "border-border-brand bg-white text-text-mid hover:border-green-brand hover:bg-green-brand hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <p className="mt-8 mb-6 text-sm text-text-light">
          Showing {allListings.length} of 120 listings
        </p>

        <div className="mb-16 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {allListings.map((listing) => (
            <ListingCard key={listing.name} {...listing} variant="full" />
          ))}
        </div>
      </div>
    </main>
  )
}
