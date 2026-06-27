import Link from "next/link"
import ListingCardActions from "@/components/listings/ListingCardActions"
import ListingImage from "@/components/listings/ListingImage"
import ListingVerifiedBadge from "@/components/listings/ListingVerifiedBadge"
import { ListingAddress, PremiumBadge } from "@/components/listings/ListingMetaIcons"
import OpenNowBadge from "@/components/listings/OpenNowBadge"
import { listingImageAlt } from "@/lib/seo"
import type { BusinessListing } from "@/lib/business-listing"
import { isListingVerified, isNewListing } from "@/lib/listing-badges"
import {
  formatListingDate,
  getCategoryDisplay,
  getListingImage,
  isHighlightedPlan,
  telUrl,
  truncateDescription,
  whatsappUrl,
} from "@/lib/listings-catalog"

export default function BusinessListingCard({
  listing,
  showStatus = true,
  priority = false,
}: {
  listing: BusinessListing
  showStatus?: boolean
  priority?: boolean
}) {
  const image = getListingImage(listing)
  const imageAlt = listingImageAlt(listing.business_name, listing.category)
  const detailHref = `/listings/${listing.id}`
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"
  const highlighted = isHighlightedPlan(listing.plan)
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""
  const callHref = listing.phone?.trim() ? telUrl(listing.phone) : ""
  const isNew = isNewListing(listing.created_at)
  const hasPlanBadge = isPremium || isFeatured
  const verified = isListingVerified(listing)

  return (
    <article
      className={`listing-card-interactive flex h-full flex-col overflow-hidden rounded-2xl border bg-white ${
        isPremium
          ? "border-orange-brand shadow-[0_8px_32px_rgba(232,98,26,0.18)] ring-2 ring-orange-brand/35"
          : isFeatured
            ? "border-green-mid shadow-[0_8px_28px_rgba(46,139,63,0.14)] ring-2 ring-green-mid/30"
            : "border-border-brand"
      }`}
    >
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View details for ${listing.business_name}`}
      />

      <div className="pointer-events-none relative z-[1]">
        <div className="relative aspect-square w-full overflow-hidden">
          <ListingImage
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {isPremium && (
            <span className="absolute top-3 left-3">
              <PremiumBadge />
            </span>
          )}
          {isFeatured && !isPremium && (
            <span className="absolute top-3 left-3 rounded-full bg-green-brand px-2.5 py-1 text-[0.72rem] font-bold text-white">
              Featured
            </span>
          )}
          {isNew && (
            <span
              className={`absolute top-3 rounded-full bg-green-brand px-2.5 py-1 text-[0.72rem] font-bold text-white ${
                hasPlanBadge ? "right-3" : "left-3"
              }`}
            >
              New
            </span>
          )}
          {verified && (
            <span className="absolute bottom-2 left-2 z-[2] sm:bottom-3 sm:left-3">
              <ListingVerifiedBadge size="card" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 pb-0">
          <p className="mb-1 text-[0.78rem] font-bold tracking-wide text-green-mid">
            {getCategoryDisplay(listing.category)}
          </p>
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-text-brand">
            {listing.business_name}
          </h3>
          {showStatus && listing.opening_hours?.trim() && (
            <div className="mt-1">
              <OpenNowBadge openingHours={listing.opening_hours} />
            </div>
          )}
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-light">
            {truncateDescription(listing.description)}
          </p>
          <ListingAddress address={listing.address} />

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-brand pt-3 text-sm">
            {listing.price_range && (
              <span className="font-bold text-green-brand">{listing.price_range}</span>
            )}
            <span className="text-xs text-text-light">
              Listed {formatListingDate(listing.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-[1] px-5 pb-5">
        <ListingCardActions
          listingId={listing.id}
          callHref={callHref || undefined}
          whatsappHref={wa || undefined}
          website={listing.website}
          whatsappHighlighted={highlighted}
        />
      </div>
    </article>
  )
}
