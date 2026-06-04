import Link from "next/link"
import HomeFeaturedCard from "@/components/home/HomeFeaturedCard"
import HomeSectionHeader from "@/components/home/HomeSectionHeader"
import type { BusinessListing } from "@/lib/business-listing"

export default function HomeWhereToStay({
  stayListings,
}: {
  stayListings: BusinessListing[]
}) {
  return (
    <section id="where-to-stay" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-[1400px]">
        <HomeSectionHeader
          title="Where to stay"
          subtitle="Hotels, resorts and guesthouses in Sauraha and around Chitwan."
          action={{ href: "/listings?category=stay", label: "View all accommodation" }}
        />
        {stayListings.length === 0 ? (
          <div className="border border-black/8 bg-surface-muted px-8 py-14 text-center">
            <p className="text-lg text-ink-muted">
              Accommodation listings coming soon.
            </p>
            <Link
              href="/list-your-business"
              className="mt-6 inline-flex bg-green-brand px-8 py-3 text-sm font-bold tracking-wide text-white uppercase hover:bg-green-mid"
            >
              List your property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {stayListings.map((listing) => (
              <HomeFeaturedCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
