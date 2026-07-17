import Link from "next/link"
import { GUIDES_RELATED_LINKS } from "@/lib/guides-seo"

export default function GuidesRelatedLinks() {
  return (
    <section className="site-container pb-16 pt-4" aria-labelledby="guides-related-heading">
      <p className="section-label text-center">Plan your trip</p>
      <h2 id="guides-related-heading" className="section-title text-center">
        Related Guides & Listings
      </h2>
      <ul className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES_RELATED_LINKS.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="flex h-full flex-col rounded-2xl border border-border-brand bg-white p-5 text-center transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-brand"
            >
              <span className="font-semibold text-green-brand">{link.label}</span>
              <span className="mt-2 text-sm leading-relaxed text-text-mid">{link.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
