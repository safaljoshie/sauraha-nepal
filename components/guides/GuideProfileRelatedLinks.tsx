import Link from "next/link"
import { GUIDES_RELATED_LINKS } from "@/lib/guides-seo"

export default function GuideProfileRelatedLinks() {
  const links = GUIDES_RELATED_LINKS.filter((link) => link.href !== "/list-your-guide").slice(0, 6)

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-5" aria-labelledby="guide-related-heading">
      <h2 id="guide-related-heading" className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
        Related activities & travel guides
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="block rounded-lg px-2 py-1 text-sm font-semibold text-green-brand hover:bg-green-brand/5 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-brand"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
