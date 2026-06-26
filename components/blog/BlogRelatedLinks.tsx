import Link from "next/link"
import type { BlogRelatedLink } from "@/lib/blog-related-links"

export default function BlogRelatedLinks({ links }: { links: BlogRelatedLink[] }) {
  if (links.length === 0) return null

  return (
    <section className="mt-16 border-t border-border-brand pt-12">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
        You might also like
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-border-brand bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold text-green-brand">{link.label}</h3>
            <p className="mt-2 text-sm text-text-light">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
