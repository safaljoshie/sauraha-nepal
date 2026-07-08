import Link from "next/link"
import GuideAvatar from "@/components/guides/GuideAvatar"
import GuideStarRating from "@/components/guides/GuideStarRating"
import SiteIcon from "@/components/icons/SiteIcon"
import {
  buildGuideProfilePath,
  formatGuideWhatsAppUrl,
  getGuideStartingPrice,
  type TourGuide,
} from "@/lib/tour-guides"

type GuideCardProps = {
  guide: TourGuide
}

export default function GuideCard({ guide }: GuideCardProps) {
  const startingPrice = getGuideStartingPrice(guide.services)
  const languages = guide.languages.filter(Boolean)
  const expertise = guide.expertise.filter(Boolean)
  const visibleLanguages = languages.slice(0, 3)
  const extraLanguages = languages.length - visibleLanguages.length
  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border-brand bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <GuideAvatar name={guide.full_name} photoUrl={guide.photo_url} size="card" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
              {guide.full_name}
            </h2>
            {guide.is_verified ? (
              <span
                className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-green-mid/15 px-2 py-0.5 text-xs font-bold text-green-brand"
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <GuideStarRating rating={guide.avg_rating} showValue />
            {guide.review_count > 0 ? (
              <span className="text-xs text-text-light">({guide.review_count} reviews)</span>
            ) : (
              <span className="text-xs text-text-light">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {visibleLanguages.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleLanguages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-text-mid"
            >
              {lang}
            </span>
          ))}
          {extraLanguages > 0 ? (
            <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-text-light">
              +{extraLanguages} more
            </span>
          ) : null}
        </div>
      ) : null}

      {expertise.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {expertise.slice(0, 3).map((tag) => (
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

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          href={buildGuideProfilePath(guide)}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-mid"
        >
          View Profile
        </Link>
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-green-brand px-4 py-2.5 text-sm font-bold text-green-brand transition-colors hover:bg-green-brand/5"
            aria-label={`WhatsApp ${guide.full_name}`}
          >
            <SiteIcon name="message-circle" size={18} strokeWidth={2.25} />
          </a>
        ) : null}
      </div>
    </article>
  )
}
