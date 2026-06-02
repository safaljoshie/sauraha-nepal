import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  formatListingDate,
  getCategoryDisplay,
  getListingImage,
  getPhotoUrls,
  whatsappUrl,
} from "@/lib/listings-catalog"
import { fetchApprovedListingById } from "@/lib/listings-fetch"

export const dynamic = "force-dynamic"

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

  return {
    title: listing.business_name,
    description,
    openGraph: {
      title: `${listing.business_name} – Sauraha Nepal`,
      description,
    },
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await fetchApprovedListingById(id)
  if (!listing) notFound()

  const photos = getPhotoUrls(listing)
  const heroImage = getListingImage(listing)
  const wa = listing.whatsapp ? whatsappUrl(listing.whatsapp) : ""
  const isPremium = listing.plan === "premium"
  const isFeatured = listing.plan === "featured"

  return (
    <main className="pb-20">
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
            {isPremium && (
              <span className="rounded-full bg-orange-brand px-3 py-1 text-xs font-bold">
                ⭐ Premium
              </span>
            )}
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
          <p className="mt-3 text-white/80">📍 {listing.address ?? "Sauraha, Nepal"}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <Image
              src={heroImage}
              alt={listing.business_name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              unoptimized={!heroImage.includes("unsplash")}
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

          {listing.opening_hours && (
            <section className="rounded-2xl border border-border-brand bg-white p-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                Opening Hours
              </h2>
              <p className="mt-3 text-text-mid">{listing.opening_hours}</p>
            </section>
          )}

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
                    className="relative block h-48 overflow-hidden rounded-xl"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="400px"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-border-brand bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {listing.phone && (
                <li>
                  <span className="font-semibold text-text-light">Phone</span>
                  <br />
                  <a
                    href={`tel:${listing.phone.replace(/\s/g, "")}`}
                    className="text-green-mid hover:underline"
                  >
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
                    Message on WhatsApp
                  </a>
                </li>
              )}
              <li>
                <span className="font-semibold text-text-light">Email</span>
                <br />
                <a
                  href={`mailto:${listing.email}`}
                  className="text-green-mid hover:underline"
                >
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
                  <span className="font-semibold text-text-light">Facebook</span>
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
              {listing.phone && (
                <a
                  href={`tel:${listing.phone.replace(/\s/g, "")}`}
                  className="btn-primary block py-3 text-center"
                >
                  Call Now
                </a>
              )}
            </div>
          </section>

          {listing.google_maps_link && (
            <section className="rounded-2xl border border-border-brand bg-white p-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                Location
              </h2>
              <p className="mt-2 text-sm text-text-mid">{listing.address}</p>
              <a
                href={listing.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-green-mid hover:underline"
              >
                Open in Google Maps →
              </a>
            </section>
          )}

          <p className="text-center text-xs text-text-light">
            Listed {formatListingDate(listing.created_at)}
          </p>
        </aside>
      </div>
    </main>
  )
}
