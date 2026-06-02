"use client"

import { useState } from "react"
import { whatsappShareUrl } from "@/lib/whatsapp"

type ListingShareButtonsProps = {
  businessName: string
  url: string
}

export default function ListingShareButtons({ businessName, url }: ListingShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const waText = `Check out ${businessName} on Sauraha Nepal: ${url}`
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
        Share this listing
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-green-brand hover:bg-cream"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={whatsappShareUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-mid/15 px-4 py-2 text-sm font-semibold text-green-brand hover:bg-green-mid/25"
        >
          WhatsApp
        </a>
        <a
          href={facebookShare}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
        >
          Facebook
        </a>
      </div>
    </section>
  )
}
