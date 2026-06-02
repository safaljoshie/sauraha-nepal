import Image from "next/image"
import Link from "next/link"
import type { BusinessListing } from "@/lib/business-listing"
import {
  formatListingDate,
  getCategoryDisplay,
  getListingImage,
  isHighlightedPlan,
  truncateDescription,
  whatsappUrl,
} from "@/lib/listings-catalog"

export default function BusinessListingCard({
  listing,
}: {
  listing: BusinessListing
}) {
  const image = getListingImage(listing)
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"
  const highlighted = isHighlightedPlan(listing.plan)
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""
  const phone = listing.phone?.trim()

  return (
    <article
      className={`card-hover flex h-full flex-col overflow-hidden rounded-[18px] border bg-white ${
        isPremium
          ? "border-orange-brand shadow-[0_8px_32px_rgba(232,98,26,0.18)] ring-2 ring-orange-brand/35"
          : isFeatured
            ? "border-green-mid shadow-[0_8px_28px_rgba(46,139,63,0.14)] ring-2 ring-green-mid/30"
            : "border-border-brand"
      }`}
    >
      <div className="relative h-[210px] overflow-hidden">
        <Image
          src={image}
          alt={listing.business_name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={image.startsWith("http") && !image.includes("unsplash")}
        />
        {isPremium && (
          <span className="absolute top-3 left-3 rounded-full bg-orange-brand px-2.5 py-1 text-[0.72rem] font-bold text-white">
            ⭐ Premium
          </span>
        )}
        {isFeatured && !isPremium && (
          <span className="absolute top-3 left-3 rounded-full bg-green-brand px-2.5 py-1 text-[0.72rem] font-bold text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-[0.78rem] font-bold tracking-wide text-green-mid">
          {getCategoryDisplay(listing.category)}
        </p>
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-text-brand">
          {listing.business_name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-light">
          {truncateDescription(listing.description)}
        </p>
        <p className="mt-2 text-sm text-text-mid">📍 {listing.address ?? "Sauraha, Nepal"}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-brand pt-3 text-sm">
          {listing.price_range && (
            <span className="font-bold text-green-brand">{listing.price_range}</span>
          )}
          <span className="text-xs text-text-light">
            Listed {formatListingDate(listing.created_at)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-full bg-green-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
          >
            View Details
          </Link>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="rounded-full border-[1.5px] border-green-brand px-4 py-1.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white"
            >
              Call
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-colors ${
                highlighted ? "bg-orange-brand hover:bg-orange-light" : "bg-green-mid hover:bg-green-brand"
              }`}
            >
              WhatsApp
            </a>
          )}
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border-brand px-4 py-1.5 text-sm font-semibold text-text-mid hover:border-green-mid"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
