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
  getCategoryDisplay,
  getListingImage,
  telUrl,
  truncateDescription,
  whatsappUrl,
} from "@/lib/listings-catalog"

export default function HomeFeaturedCard({
  listing,
  showStatus = true,
  compactDesktopImage = false,
  priority = false,
}: {
  listing: BusinessListing
  showStatus?: boolean
  /** Desktop image at 65% of square height (e.g. Where to stay preview). */
  compactDesktopImage?: boolean
  priority?: boolean
}) {
  const image = getListingImage(listing)
  const imageAlt = listingImageAlt(listing.business_name, listing.category)
  const slug = listing.slug?.trim()
  const detailHref = slug ? `/listings/${slug}` : `/listings/${listing.id}`
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""
  const callHref = listing.phone?.trim() ? telUrl(listing.phone) : ""
  const isNew = isNewListing(listing.created_at)
  const hasPlanBadge = isPremium || isFeatured
  const verified = isListingVerified(listing)

  return (
    <article
      className={`listing-card-interactive flex h-full flex-col overflow-hidden border bg-white ${
        isPremium
          ? "border-orange-brand"
          : isFeatured
            ? "border-green-mid"
            : "border-black/8"
      }`}
    >
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={`View details for ${listing.business_name}`}
      />

      <div className="pointer-events-none relative z-[1]">
        <div
          className={`relative w-full overflow-hidden ${
            compactDesktopImage ? "aspect-square md:aspect-[20/13]" : "aspect-square"
          }`}
        >
          <ListingImage
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes={
              compactDesktopImage
                ? "(max-width: 768px) 100vw, 25vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
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
          <h3 className="font-heading text-lg font-bold text-ink">
            {listing.business_name}
          </h3>
          {showStatus && listing.opening_hours?.trim() && (
            <div className="mt-1">
              <OpenNowBadge openingHours={listing.opening_hours} />
            </div>
          )}
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-text-light">
            {truncateDescription(listing.description, 80)}
          </p>
          <ListingAddress address={listing.address} />
          <div className="mt-3 flex items-center justify-between border-t border-border-brand pt-3">
            {listing.price_range ? (
              <span className="font-bold text-green-brand">{listing.price_range}</span>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>

      <div className="relative z-[1] px-5 pb-5">
        <ListingCardActions
          detailHref={detailHref}
          callHref={callHref || undefined}
          whatsappHref={wa || undefined}
        />
      </div>
    </article>
  )
}
