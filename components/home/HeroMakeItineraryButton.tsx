"use client"

import { useChatUI } from "@/components/ChatUIProvider"
import { heroCtaCompact } from "@/lib/hero-cta-classes"

export default function HeroMakeItineraryButton() {
  const { openChat } = useChatUI()

  return (
    <button
      type="button"
      onClick={openChat}
      className={`${heroCtaCompact} border border-orange-brand font-bold text-orange-brand hover:bg-orange-brand/20 md:border-2 md:font-semibold`}
    >
      Make Itinerary
    </button>
  )
}
