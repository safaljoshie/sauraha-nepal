"use client"

import Link from "next/link"
import HomeFeaturedCard from "@/components/home/HomeFeaturedCard"
import HomeSectionHeader from "@/components/home/HomeSectionHeader"
import { useT } from "@/components/i18n/LocaleProvider"
import type { BusinessListingSummary } from "@/lib/business-listing"

export default function HomeWhereToStay({
  stayListings,
}: {
  stayListings: BusinessListingSummary[]
}) {
  const t = useT()

  return (
    <section id="where-to-stay" className="home-section scroll-mt-24">
      <div className="site-container">
        <HomeSectionHeader
          title={t("home.stayTitle")}
          subtitle={t("home.staySubtitle")}
          action={{ href: "/listings?category=stay", label: t("home.stayViewAll") }}
        />
        {stayListings.length === 0 ? (
          <div className="border border-black/8 bg-surface-muted px-8 py-14 text-center">
            <p className="text-lg text-ink-muted">{t("home.stayEmpty")}</p>
            <Link
              href="/list-your-business"
              className="mt-6 inline-flex bg-green-brand px-8 py-3 text-sm font-bold tracking-wide text-white uppercase hover:bg-green-mid"
            >
              {t("home.stayEmptyCta")}
            </Link>
          </div>
        ) : (
          <div className="home-where-to-stay-preview">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {stayListings.map((listing, index) => (
                <HomeFeaturedCard
                  key={listing.id}
                  listing={listing}
                  showStatus={false}
                  compactDesktopImage
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
