import Link from "next/link"
import { MessageCircle, Phone } from "lucide-react"
import GuideAvatar from "@/components/guides/GuideAvatar"
import GuideStarRating from "@/components/guides/GuideStarRating"
import SiteIcon from "@/components/icons/SiteIcon"
import {
  formatGuidePhoneUrl,
  formatGuideWhatsAppUrl,
  getGuideStartingPrice,
  truncateGuideBio,
  type TourGuide,
} from "@/lib/tour-guides"

type GuideCardProps = {
  guide: TourGuide
}

export default function GuideCard({ guide }: GuideCardProps) {
  const startingPrice = getGuideStartingPrice(guide.services)
  const languages = guide.languages.filter(Boolean)
  const expertise = guide.expertise.filter(Boolean)
  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""
  const callUrl = guide.phone ? formatGuidePhoneUrl(guide.phone) : ""
  const bioSnippet = guide.bio ? truncateGuideBio(guide.bio, 120) : null
  const profileHref = `/guides/${guide.slug || guide.id}`

  return (
    <article className="flex h-full w-full flex-col items-center rounded-2xl border border-border-brand bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <GuideAvatar
        name={guide.full_name}
        photoUrl={guide.photo_url}
        size="card"
        alt={guide.photo_url ? `${guide.full_name}, jungle guide in Sauraha` : undefined}
      />
      <div className="mt-4 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
            <Link href={profileHref} className="hover:text-green-mid">
              {guide.full_name}
            </Link>
          </h3>
          {guide.is_verified ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-mid/15 px-2 py-0.5 text-xs font-bold text-green-brand"
              title="Verified guide"
            >
              <SiteIcon name="check" size={14} strokeWidth={2.5} />
              Verified
            </span>
          ) : null}
        </div>
        {guide.years_experience != null && guide.years_experience > 0 ? (
          <p className="mt-1 text-sm text-text-light">
            {guide.years_experience} year{guide.years_experience === 1 ? "" : "s"} experience
          </p>
        ) : null}
        {guide.location?.trim() ? (
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-text-light">
            <SiteIcon name="map-pin" size={14} className="shrink-0 text-green-brand" />
            {guide.location.trim()}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <GuideStarRating rating={guide.avg_rating} showValue />
          {guide.review_count > 0 ? (
            <span className="text-xs text-text-light">({guide.review_count} reviews)</span>
          ) : null}
        </div>
      </div>

      {bioSnippet ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-text-mid">{bioSnippet}</p>
      ) : null}

      {languages.length > 0 ? (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-text-mid"
            >
              {lang}
            </span>
          ))}
        </div>
      ) : null}

      {expertise.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Specialities">
          {expertise.slice(0, 4).map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border-brand px-2.5 py-1 text-xs font-medium text-text-mid"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {startingPrice != null ? (
        <p className="mt-4 text-sm text-text-mid">
          From <span className="font-bold text-green-brand">NPR {startingPrice.toLocaleString()}</span>
        </p>
      ) : null}

      {(guide.phone || guide.whatsapp) && (
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
          {guide.phone ? (
            <a
              href={callUrl}
              className="inline-flex items-center gap-1.5 font-semibold text-green-brand hover:text-green-mid hover:underline"
            >
              <Phone size={16} aria-hidden />
              {guide.phone}
            </a>
          ) : null}
          {guide.whatsapp ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-green-brand hover:text-green-mid hover:underline"
            >
              <MessageCircle size={16} aria-hidden />
              WhatsApp
            </a>
          ) : null}
        </div>
      )}

      <div className="mt-auto flex w-full flex-wrap justify-center gap-2 pt-5">
        <Link
          href={profileHref}
          className="inline-flex min-w-[8rem] flex-1 items-center justify-center rounded-xl bg-green-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-mid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-brand sm:flex-none"
        >
          View Profile
        </Link>
      </div>
    </article>
  )
}
