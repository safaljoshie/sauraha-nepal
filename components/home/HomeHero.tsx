import Link from "next/link"
import HomeDestinationSearch from "@/components/home/HomeDestinationSearch"
import type { HeroMedia } from "@/lib/site-content"
import type { BusinessListing } from "@/lib/business-listing"

type HomeHeroProps = {
  primaryHeroMedia: HeroMedia | null
  listings: BusinessListing[]
}

export default function HomeHero({ primaryHeroMedia, listings }: HomeHeroProps) {
  const heroVideo = primaryHeroMedia?.type === "video" ? primaryHeroMedia : null

  return (
    <section
      aria-label="Discover Sauraha"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-ink"
    >
      {heroVideo ? (
        <video
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={heroVideo.poster_url ?? undefined}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
      ) : null}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
        aria-hidden
      />

      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pt-[88px] pb-12 md:px-10 md:pb-16">
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
          <HomeDestinationSearch listings={listings} />
        </div>
      </div>
    </section>
  )
}
