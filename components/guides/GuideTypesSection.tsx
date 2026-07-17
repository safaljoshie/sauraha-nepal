import SiteIcon from "@/components/icons/SiteIcon"
import { GUIDE_TYPE_CARDS } from "@/lib/guides-seo"

export default function GuideTypesSection() {
  return (
    <section
      className="home-section home-section-muted"
      aria-labelledby="guide-types-heading"
    >
      <div className="site-container">
        <p className="section-label text-center">Guide specialities</p>
        <h2 id="guide-types-heading" className="section-title text-center">
          Choose the Right Guide for Your Sauraha Experience
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_TYPE_CARDS.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-border-brand bg-white p-5 text-center shadow-sm"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-green-brand/10 text-green-brand">
                <SiteIcon name={card.icon} size={20} />
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-lg font-bold text-text-brand">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
