import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ListingImage from "@/components/listings/ListingImage"
import ListingDetailMapSection from "@/components/listings/ListingDetailMapSection"
import { ListingAddress, PremiumBadge } from "@/components/listings/ListingMetaIcons"
import ListingShareButtons from "@/components/listings/ListingShareButtons"
import OpeningHoursDisplay from "@/components/listings/OpeningHoursDisplay"
import {
  formatListingDate,
  formatWhatsAppDisplay,
  getCategoryDisplay,
  getListingImage,
  getPhotoUrls,
  telUrl,
  whatsappUrl,
} from "@/lib/listings-catalog"
import { getMapCoordinates, parseCoordinates } from "@/lib/google-maps"
import { fetchApprovedListingById } from "@/lib/listings-fetch"
import { SITE_URL } from "@/lib/blog-posts"
import { listingJsonLd, pageMetadata } from "@/lib/seo"

export const revalidate = 3600

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchApprovedListingById(id)
  if (!listing) {
    return { title: "Listing Not Found" }
  }
  const description =
    listing.description?.slice(0, 160) ??
    `${listing.business_name} in Sauraha, Nepal — ${listing.category}`
  const image = getListingImage(listing)

  return pageMetadata({
    title: listing.business_name,
    description,
    path: `/listings/${id}`,
    image,
    type: "website",
  })
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await fetchApprovedListingById(id)
  if (!listing) notFound()

  const photos = getPhotoUrls(listing)
  const heroImage = getListingImage(listing)
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""
  const callHref = listing.phone?.trim() ? telUrl(listing.phone) : ""
  const listingUrl = `${SITE_URL}/listings/${id}`
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"
  const jsonLd = listingJsonLd(listing)

  const mapsLink = listing.google_maps_link?.trim() ?? ""
  let coords = mapsLink ? parseCoordinates(mapsLink) : null
  if (!coords && mapsLink) {
    coords = await getMapCoordinates(mapsLink)
  }

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-4 py-14 text-white md:px-8">
        <div className="relative z-10 mx-auto max-w-4xl">
          <Link
            href="/listings"
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
          >
            ← Back to listings
          </Link>
          <p className="text-sm font-bold tracking-wide text-orange-light">
            {getCategoryDisplay(listing.category)}
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl">
            {listing.business_name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {isPremium && <PremiumBadge className="px-3 py-1 text-xs" />}
            {isFeatured && !isPremium && (
              <span className="rounded-full bg-green-mid px-3 py-1 text-xs font-bold">
                Featured
              </span>
            )}
            {listing.price_range && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {listing.price_range}
              </span>
            )}
          </div>
          <ListingAddress address={listing.address} className="text-white/80 [&_svg]:text-white/80" />
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
            <ListingImage
              src={heroImage}
              alt={listing.business_name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
          </div>

          {listing.description && (
            <section className="rounded-2xl border border-border-brand bg-white p-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                About
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text-mid">
                {listing.description}
              </p>
            </section>
          )}

          {listing.opening_hours && <OpeningHoursDisplay hours={listing.opening_hours} />}

          {photos.length > 0 && (
            <section className="rounded-2xl border border-border-brand bg-white p-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                Photos
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {photos.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-48 overflow-hidden rounded-2xl"
                  >
                    <ListingImage src={url} alt="" fill className="object-cover transition-transform hover:scale-105" sizes="400px" />
                  </a>
                ))}
              </div>
            </section>
          )}

          <ListingDetailMapSection
            listingId={listing.id}
            businessName={listing.business_name}
            category={listing.category}
            address={listing.address}
            googleMapsLink={listing.google_maps_link}
            coords={coords}
          />
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-border-brand bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                Contact
              </h2>
              <Link
                href="/claim-listing"
                className="rounded-full border border-orange-brand/30 bg-orange-brand/10 px-3 py-1 text-xs font-semibold text-orange-brand transition-colors hover:bg-orange-brand/15"
              >
                Is this your business? Claim it
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {callHref && (
                <li>
                  <span className="font-semibold text-text-light">Phone</span>
                  <br />
                  <a href={callHref} className="text-green-mid hover:underline">
                    {listing.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <span className="font-semibold text-text-light">WhatsApp</span>
                  <br />
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-mid hover:underline"
                  >
                    {formatWhatsAppDisplay(listing.whatsapp!)}
                  </a>
                </li>
              )}
              <li>
                <span className="font-semibold text-text-light">Email</span>
                <br />
                <a href={`mailto:${listing.email}`} className="text-green-mid hover:underline">
                  {listing.email}
                </a>
              </li>
              {listing.website && (
                <li>
                  <span className="font-semibold text-text-light">Website</span>
                  <br />
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-green-mid hover:underline"
                  >
                    {listing.website}
                  </a>
                </li>
              )}
              {listing.facebook && (
                <li>
                  <span className="font-semibold text-text-light">Social Media</span>
                  <br />
                  <a
                    href={listing.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-green-mid hover:underline"
                  >
                    {listing.facebook}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-6 flex flex-col gap-2">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-orange block py-3 text-center"
                >
                  WhatsApp
                </a>
              )}
              {callHref && (
                <a href={callHref} className="btn-primary block py-3 text-center">
                  Call Now
                </a>
              )}
            </div>
          </section>

          <ListingShareButtons businessName={listing.business_name} url={listingUrl} />

          <p className="text-center text-xs text-text-light">
            Listed {formatListingDate(listing.created_at)}
          </p>
        </aside>
      </div>
    </main>
  )
}
