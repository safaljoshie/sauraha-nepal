import Link from "next/link"
import { Suspense } from "react"
import HeroMakeItineraryButton from "@/components/home/HeroMakeItineraryButton"
import HomeHeroSearchSlot from "@/components/home/HomeHeroSearchSlot"
import HomeHeroVideo from "@/components/home/HomeHeroVideo"
import HeroWeatherSlot from "@/components/home/HeroWeatherSlot"
import { HeroWeatherSkeleton } from "@/components/home/HeroWeather"
import { heroCtaCompact } from "@/lib/hero-cta-classes"
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
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-x-hidden bg-ink max-md:overflow-y-visible md:overflow-hidden"
    >
      {heroVideo ? (
        <HomeHeroVideo url={heroVideo.url} posterUrl={heroVideo.poster_url} />
      ) : null}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
        aria-hidden
      />

      <div className="site-container mobile-bottom-nav-clearance relative z-20 w-full pt-[88px] md:pb-8">
        <div className="home-hero-content">
        <p className="sr-only">
          <span>Discover Sauraha &amp; Chitwan National Park</span>
        </p>
        <div className="hero-headline-wrap max-w-4xl" aria-hidden={false}>
          <div className="mb-5">
            <Suspense fallback={<HeroWeatherSkeleton />}>
              <HeroWeatherSlot />
            </Suspense>
          </div>
          <span className="nsw-hero-line md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">Discover</span>
          <span className="nsw-hero-line text-orange-brand md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">The Wild</span>
          <span className="nsw-hero-line md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">In Sauraha</span>
        </div>
        <h1 className="sr-only">Discover Sauraha &amp; Chitwan National Park</h1>

        <p className="hero-subtitle mt-6 max-w-xl leading-snug text-white/90 max-md:text-[clamp(0.8125rem,3vw,0.9375rem)] max-md:leading-[1.45] md:mt-6 md:max-w-[28.8rem] md:!text-[1.08rem] md:!leading-relaxed">
          Your official guide to hotels, jungle safaris, restaurants and travel
          <br className="md:hidden" aria-hidden />
          {" "}information at the gateway to Chitwan National Park.
        </p>

        <div className="hero-cta-row mt-8 flex flex-nowrap items-stretch gap-2 md:flex-wrap md:gap-3">
          <Link
            href="#places"
            className={`hero-cta ${heroCtaCompact} bg-white tracking-wide text-ink normal-case hover:bg-white/90 md:uppercase`}
          >
            Explore places
          </Link>
          <HeroMakeItineraryButton />
          <Link
            href="#plan-trip"
            className={`hero-cta ${heroCtaCompact} border border-white/70 text-white hover:bg-white/10`}
          >
            Plan your trip
          </Link>
        </div>

        <div className="hero-search-wrap mt-10 max-w-2xl">
          <HomeHeroSearchSlot
            searchListings={searchListings}
            searchCategories={searchCategories}
          />
        </div>
        </div>
      </div>
    </section>
  )
}
