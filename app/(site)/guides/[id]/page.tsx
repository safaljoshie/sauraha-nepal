import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import GuideAvatar from "@/components/guides/GuideAvatar"
import GuideProfileBreadcrumbs from "@/components/guides/GuideProfileBreadcrumbs"
import GuideProfileRelatedLinks from "@/components/guides/GuideProfileRelatedLinks"
import GuideContactSection, {
  GuideContactActions,
  GuideStickyCtaGate,
} from "@/components/guides/GuideContactSection"
import { GuideReviewsSection } from "@/components/guides/GuideReviewsSection"
import GuideStarRating from "@/components/guides/GuideStarRating"
import SiteIcon from "@/components/icons/SiteIcon"
import { isListingUuid } from "@/lib/listing-slug"
import { formatInrFromNpr, formatUsdFromNpr } from "@/lib/currency"
import {
  buildGuideProfileJsonLd,
  buildGuideProfileTitle,
} from "@/lib/guides-seo"
import { socialImageUrl } from "@/lib/image"
import {
  buildGuideProfilePath,
  buildGuideProfileUrl,
  fetchApprovedGuideBySlugOrId,
  fetchApprovedGuideReviews,
  fetchApprovedGuides,
  truncateGuideBio,
  type GuideService,
} from "@/lib/tour-guides"

type PageProps = {
  params: Promise<{ id: string }>
}

/** Prerender every approved guide profile; new ones still render on demand. */
export async function generateStaticParams() {
  const guides = await fetchApprovedGuides()
  return guides.map((guide) => ({ id: guide.slug?.trim() || guide.id }))
}

function formatVerifiedDate(iso: string | null) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

function serviceIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes("bird")) return "binoculars"
  if (lower.includes("jeep") || lower.includes("safari")) return "car"
  if (lower.includes("canoe") || lower.includes("boat")) return "compass"
  if (lower.includes("culture") || lower.includes("village")) return "heart"
  return "map"
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const guide = await fetchApprovedGuideBySlugOrId(id)
  if (!guide) {
    return { title: { absolute: "Guide Not Found | Sauraha Nepal" } }
  }

  const title = buildGuideProfileTitle(guide)
  const languages = guide.languages.filter(Boolean).join(", ")
  const description =
    guide.meta_description?.trim() ||
    `${truncateGuideBio(guide.bio, 120)}${languages ? ` Speaks ${languages}.` : ""} Contact directly — no commission.`

  const profileUrl = buildGuideProfileUrl(guide)

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: "Sauraha Nepal",
      type: "profile",
      images: guide.photo_url ? [{ url: socialImageUrl(guide.photo_url) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: guide.photo_url ? [socialImageUrl(guide.photo_url)] : undefined,
    },
  }
}

export default async function GuideProfilePage({ params }: PageProps) {
  const { id } = await params
  const guide = await fetchApprovedGuideBySlugOrId(id)
  if (!guide) notFound()

  if (
    isListingUuid(id) &&
    guide.slug?.trim() &&
    id !== guide.slug.trim()
  ) {
    permanentRedirect(buildGuideProfilePath(guide))
  }

  const reviews = await fetchApprovedGuideReviews(guide.id)

  const verifiedDate = formatVerifiedDate(guide.verified_at)
  const services = guide.services as GuideService[]

  const contactGuide = {
    id: guide.id,
    phone: guide.phone,
    whatsapp: guide.whatsapp,
    email: guide.email,
    facebook_url: guide.facebook_url,
    instagram_url: guide.instagram_url,
    website_url: guide.website_url,
  }

  const jsonLd = buildGuideProfileJsonLd(guide)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="pb-24 md:pb-16">
        {guide.is_verified ? (
          <div className="mt-[68px] bg-green-mid/15 px-4 py-3 text-center text-sm text-green-brand">
            <strong>Verified Guide</strong> — identity and licence confirmed by Sauraha Nepal
            {verifiedDate ? ` · ${verifiedDate}` : ""}
          </div>
        ) : (
          <div className="mt-[68px]" />
        )}

        <section className="bg-gradient-to-br from-green-brand to-[#0d3a18] px-4 py-12 text-white md:px-8">
          <div className="site-container mx-auto max-w-4xl">
            <GuideProfileBreadcrumbs guideName={guide.full_name} />
            <Link
              href="/guides"
              className="mb-6 mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
            >
              ← All jungle guides
            </Link>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <GuideAvatar
                name={guide.full_name}
                photoUrl={guide.photo_url}
                size="profile"
                alt={
                  guide.photo_url
                    ? `${guide.full_name}, jungle guide in Sauraha, Chitwan`
                    : undefined
                }
              />
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
                  {guide.full_name}
                </h1>
                <p className="mt-2 text-sm text-white/85">Jungle guide in Sauraha, Chitwan</p>
                {guide.nickname ? (
                  <p className="mt-1 text-white/80">&ldquo;{guide.nickname}&rdquo;</p>
                ) : null}
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/85">
                  <SiteIcon name="map-pin" size={16} className="text-orange-light" />
                  {guide.location ?? "Sauraha, Chitwan"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.licence_number ? (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                      Govt. Licensed
                    </span>
                  ) : null}
                  {guide.expertise.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    <GuideStarRating rating={guide.avg_rating} />
                    {guide.review_count > 0 ? ` (${guide.review_count})` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="site-container mx-auto max-w-4xl space-y-6 py-10">
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border-brand bg-white p-4 text-center sm:gap-6 sm:p-6">
            <div>
              <p className="text-2xl font-bold text-green-brand">
                {guide.years_experience ?? "—"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                Years guiding
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-brand">{guide.review_count}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                Total reviews
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-brand">
                {guide.avg_rating > 0 ? guide.avg_rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                Average rating
              </p>
            </div>
          </div>

          <GuideContactSection guide={contactGuide} />

          {guide.languages.length > 0 ? (
            <ProfileCard title="Languages">
              <div className="flex flex-wrap gap-2">
                {guide.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-cream px-3 py-1.5 text-sm font-semibold text-text-mid"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </ProfileCard>
          ) : null}

          {guide.expertise.length > 0 ? (
            <ProfileCard title="Specialities">
              <ul className="grid gap-2 sm:grid-cols-2">
                {guide.expertise.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-mid">
                    <SiteIcon name="check" size={16} className="text-green-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </ProfileCard>
          ) : null}

          {services.length > 0 ? (
            <ProfileCard title="Services & pricing starting from">
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="rounded-xl border border-border-brand bg-cream/60 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-brand/10 text-green-brand">
                        <SiteIcon name={serviceIcon(service.name)} size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-text-brand">{service.name}</p>
                        <p className="mt-1 text-lg font-bold text-green-brand">
                          NPR {service.price_npr.toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-sm text-text-light">
                          ≈ {formatUsdFromNpr(service.price_npr)} · {formatInrFromNpr(service.price_npr)}
                        </p>
                        {service.description ? (
                          <p className="mt-2 text-sm text-text-light">{service.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ProfileCard>
          ) : null}

          {guide.bio ? (
            <ProfileCard title="About">
              <p className="text-sm leading-relaxed text-text-mid whitespace-pre-line">{guide.bio}</p>
            </ProfileCard>
          ) : null}

          <GuideReviewsSection
            guideId={guide.id}
            avgRating={guide.avg_rating}
            reviewCount={guide.review_count}
            reviews={reviews}
          />

          <GuideProfileRelatedLinks />

          <aside className="rounded-2xl border border-border-brand bg-cream/60 p-5 text-sm leading-relaxed text-text-mid">
            <p>
              <strong className="text-text-brand">Disclaimer:</strong> Sauraha Nepal lists guide
              profiles for discovery. Verification means we have reviewed submitted identity and
              licence details — it is not a guarantee of service quality. Prices, permits and park
              rules can change. Confirm all details directly with {guide.full_name} before your
              visit.
            </p>
          </aside>

          <GuideContactActions guide={contactGuide} className="hidden md:flex" />
        </div>
      </main>
      <GuideStickyCtaGate guide={contactGuide} />
    </>
  )
}

function ProfileCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-brand bg-white p-5">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
