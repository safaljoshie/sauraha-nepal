"use client"

import { useChatUI } from "@/components/ChatUIProvider"
import { heroCtaCompact } from "@/lib/hero-cta-classes"

export default function HeroMakeItineraryButton() {
  const { openChat } = useChatUI()

  return (
    <button
      type="button"
      onClick={openChat}
      className={`hero-cta ${heroCtaCompact} border border-orange-brand text-orange-brand hover:bg-orange-brand/20 md:border-2`}
    >
      Make Itinerary
    </button>
  )
}
