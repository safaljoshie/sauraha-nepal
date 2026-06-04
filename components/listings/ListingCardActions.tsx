"use client"

import Link from "next/link"
import type { MouseEvent } from "react"

type ListingCardActionsProps = {
  listingId: string
  callHref?: string
  whatsappHref?: string
  website?: string | null
  whatsappHighlighted?: boolean
}

function stopCardNavigation(e: MouseEvent) {
  e.stopPropagation()
}

export default function ListingCardActions({
  listingId,
  callHref,
  whatsappHref,
  website,
  whatsappHighlighted = false,
}: ListingCardActionsProps) {
  const detailHref = `/listings/${listingId}`

  return (
    <div
      className="relative z-[1] mt-3 flex flex-wrap gap-2"
      onClick={stopCardNavigation}
    >
      <Link
        href={detailHref}
        className="rounded-xl bg-green-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
      >
        View Details
      </Link>
      {callHref && (
        <a
          href={callHref}
          onClick={stopCardNavigation}
          className="rounded-xl border-[1.5px] border-green-brand px-4 py-1.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white"
        >
          Call
        </a>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopCardNavigation}
          className={`rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
            whatsappHighlighted
              ? "bg-orange-brand hover:bg-orange-light"
              : "bg-green-mid hover:bg-green-brand"
          }`}
        >
          WhatsApp
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopCardNavigation}
          className="rounded-xl border border-border-brand px-4 py-1.5 text-sm font-semibold text-text-mid hover:border-green-mid"
        >
          Website
        </a>
      )}
    </div>
  )
}
