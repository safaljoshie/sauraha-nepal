"use client"

import HeroMakeItineraryButton from "@/components/home/HeroMakeItineraryButton"
import HomeHeroSearchSlot from "@/components/home/HomeHeroSearchSlot"
import HomeHeroVideo from "@/components/home/HomeHeroVideo"
import HeroWeather from "@/components/home/HeroWeather"
import { useT } from "@/components/i18n/LocaleProvider"
import type { CategoryCatalog } from "@/lib/category-catalog"
import type { HeroMedia } from "@/lib/site-content"
import type { HeroSearchListing } from "@/lib/listings-catalog"

type HomeHeroProps = {
  primaryHeroMedia: HeroMedia | null
  searchListings: HeroSearchListing[]
  searchCategories: CategoryCatalog
}

export default function HomeHero({ primaryHeroMedia, searchListings, searchCategories }: HomeHeroProps) {
  const t = useT()
  const heroVideo = primaryHeroMedia?.type === "video" ? primaryHeroMedia : null

  return (
    <section
      aria-label={t("home.heroAria")}
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-visible bg-ink"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {heroVideo ? <HomeHeroVideo /> : null}
      </div>
      <div
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
        aria-hidden
      />

      <div className="site-container mobile-bottom-nav-clearance relative z-20 w-full pt-[88px] md:pb-8">
        <div className="home-hero-content overflow-visible">
          <p className="sr-only">
            <span>{t("home.heroSr")}</span>
          </p>
          <div className="hero-headline-wrap max-w-4xl" aria-hidden={false}>
            <div className="mb-5">
              <HeroWeather />
            </div>
            <span className="nsw-hero-line md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">
              {t("home.heroLine1")}
            </span>
            <span className="nsw-hero-line text-orange-brand md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">
              {t("home.heroLine2")}
            </span>
            <span className="nsw-hero-line md:!text-[3.3rem] lg:!text-[4.2rem] xl:!text-[5.28rem]">
              {t("home.heroLine3")}
            </span>
          </div>
          <h1 className="sr-only">{t("home.heroSr")}</h1>

          <p className="hero-subtitle mt-6 max-w-xl leading-snug text-white/90 max-md:text-[clamp(0.8125rem,3vw,0.9375rem)] max-md:leading-[1.45] md:mt-6 md:max-w-[28.8rem] md:!text-[1.08rem] md:!leading-relaxed">
            {t("home.heroSubtitle")}
          </p>

          <div className="hero-cta-row mt-8 flex flex-nowrap items-stretch gap-2 md:flex-wrap md:gap-3">
            <HeroMakeItineraryButton />
          </div>

          <div className="hero-search-wrap relative z-30 mt-10 max-w-2xl overflow-visible">
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
