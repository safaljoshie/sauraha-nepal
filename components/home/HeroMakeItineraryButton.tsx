"use client"

import { useChatUI } from "@/components/ChatUIProvider"

export default function HeroMakeItineraryButton() {
  const { openChat } = useChatUI()

  return (
    <button
      type="button"
      onClick={openChat}
      className="inline-flex items-center rounded-xl border-2 border-orange-brand px-6 py-3 text-sm font-semibold text-orange-brand transition-colors hover:bg-orange-brand/20"
    >
      Make Itinerary
    </button>
  )
}
