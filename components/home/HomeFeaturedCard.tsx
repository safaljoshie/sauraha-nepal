import Link from "next/link"
import ListingImage from "@/components/listings/ListingImage"
import type { BusinessListing } from "@/lib/business-listing"
import {
  getCategoryDisplay,
  getListingImage,
  truncateDescription,
  whatsappUrl,
} from "@/lib/listings-catalog"

export default function HomeFeaturedCard({ listing }: { listing: BusinessListing }) {
  const image = getListingImage(listing)
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""

  return (
    <article
      className={`card-hover flex h-full flex-col overflow-hidden rounded-[18px] border bg-white ${
        isPremium
          ? "border-orange-brand ring-2 ring-orange-brand/30"
          : isFeatured
            ? "border-green-mid ring-2 ring-green-mid/25"
            : "border-border-brand"
      }`}
    >
      <div className="relative h-[200px] overflow-hidden">
        <ListingImage
          src={image}
          alt={listing.business_name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
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
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-light">
          {truncateDescription(listing.description, 80)}
        </p>
        <p className="mt-2 text-sm text-text-mid">📍 {listing.address ?? "Sauraha, Nepal"}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border-brand pt-3">
          {listing.price_range ? (
            <span className="font-bold text-green-brand">{listing.price_range}</span>
          ) : (
            <span />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-full bg-green-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
          >
            View Details
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-orange-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-light"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
