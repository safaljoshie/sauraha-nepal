import Link from "next/link"
import HomeHeroSearchSlot from "@/components/home/HomeHeroSearchSlot"
import HomeHeroVideo from "@/components/home/HomeHeroVideo"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { HeroMedia } from "@/lib/site-content"
import type { HeroSearchListing } from "@/lib/listings-catalog"

type HomeHeroProps = {
  primaryHeroMedia: HeroMedia | null
  searchListings: HeroSearchListing[]
  searchCategories: CategoryCatalog
}

export default function HomeHero({ primaryHeroMedia, searchListings, searchCategories }: HomeHeroProps) {
  const heroVideo = primaryHeroMedia?.type === "video" ? primaryHeroMedia : null

  return (
    <section
      aria-label="Discover Sauraha"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-ink"
    >
      {heroVideo ? (
        <HomeHeroVideo url={heroVideo.url} posterUrl={heroVideo.poster_url} />
      ) : null}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
        aria-hidden
      />

      <div className="site-container relative z-20 w-full pt-[88px] pb-12 md:pb-16">
        <p className="sr-only">
          <span>Discover Sauraha &amp; Chitwan National Park</span>
        </p>
        <div className="max-w-4xl" aria-hidden={false}>
          <span className="nsw-hero-line">Discover</span>
          <span className="nsw-hero-line text-orange-brand">The Wild</span>
          <span className="nsw-hero-line">In Sauraha</span>
        </div>
        <h1 className="sr-only">Discover Sauraha &amp; Chitwan National Park</h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
          Your official guide to hotels, jungle safaris, restaurants and travel
          information at the gateway to Chitwan National Park.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#places"
            className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold tracking-wide text-ink uppercase transition-colors hover:bg-white/90"
          >
            Explore places
          </Link>
          <Link
            href="#plan-trip"
            className="inline-flex items-center rounded-xl border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Plan your trip
          </Link>
        </div>

        <div className="mt-10 max-w-2xl">
          <HomeHeroSearchSlot
            searchListings={searchListings}
            searchCategories={searchCategories}
          />
        </div>
      </div>
    </section>
  )
}
