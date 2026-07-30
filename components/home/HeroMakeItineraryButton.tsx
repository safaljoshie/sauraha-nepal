"use client"

import { useChatUI } from "@/components/ChatUIProvider"
import { useT } from "@/components/i18n/LocaleProvider"
import { heroCtaCompact } from "@/lib/hero-cta-classes"

export default function HeroMakeItineraryButton() {
  const { openChat } = useChatUI()
  const t = useT()

  return (
    <button
      type="button"
      onClick={openChat}
      className={`hero-cta ${heroCtaCompact} border border-orange-brand text-orange-brand hover:bg-orange-brand/20 md:border-2`}
    >
      {t("home.makeItinerary")}
    </button>
  )
}
