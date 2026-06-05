import Link from "next/link"
import HomeImageCard from "@/components/home/HomeImageCard"
import { PLACES_TO_GO } from "@/lib/homepage-constants"

export default function HomePlacesToGo() {
  return (
    <section id="places" className="home-section home-section-muted scroll-mt-24">
      <div className="site-container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <h2 className="nsw-section-title">Places to go</h2>
          <Link href="/listings" className="nsw-view-all shrink-0">
            View all listings
          </Link>
        </div>
        <div className="-mx-2 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible lg:grid-cols-6">
          {PLACES_TO_GO.map((place) => (
            <div key={place.name} className="snap-start md:snap-none">
              <HomeImageCard
                href={place.href}
                image={place.image}
                title={place.name}
                subtitle={place.tagline}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
