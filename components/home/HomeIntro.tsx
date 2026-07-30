"use client"

import Link from "next/link"
import { useT } from "@/components/i18n/LocaleProvider"

export default function HomeIntro() {
  const t = useT()

  return (
    <section id="why-visit" className="home-section home-intro scroll-mt-24">
      <div className="site-container">
        <h2 className="nsw-section-title home-intro-title">{t("home.introTitle")}</h2>
        <div className="home-intro-body mt-6 max-w-3xl space-y-5 text-[1.125rem] leading-[1.8] text-ink-muted">
          <p>{t("home.introP1")}</p>
          <p>{t("home.introP2")}</p>
          <p className="hidden md:block">{t("home.introP3")}</p>
        </div>
        <Link href="/about" className="nsw-view-all home-intro-link mt-8 inline-flex">
          {t("home.introCta")}
        </Link>
      </div>
    </section>
  )
}
