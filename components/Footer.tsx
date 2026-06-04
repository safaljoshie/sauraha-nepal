import Link from "next/link"
import {
  buildFooterExploreLinks,
  type CategoryCatalog,
} from "@/lib/category-catalog"
import { fetchSiteSettings } from "@/lib/site-settings"

const businessLinks = [
  { href: "/list-your-business", label: "List Your Business" },
  { href: "/contact", label: "Advertising" },
]

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

function hasSocialUrl(url: string) {
  return url.trim().length > 0
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
        {title}
      </h4>
      <ul>
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`} className="mb-2">
            <Link
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-[#e8621a]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function Footer({ catalog }: { catalog: CategoryCatalog }) {
  const settings = await fetchSiteSettings()
  const exploreLinks = buildFooterExploreLinks(catalog)

  const facebookUrl = settings.facebook_url.trim()
  const instagramUrl = settings.instagram_url.trim()
  const showFacebook = hasSocialUrl(facebookUrl)
  const showInstagram = hasSocialUrl(instagramUrl)

  return (
    <footer className="bg-text-brand px-8 py-14 text-white/75">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-xl text-white">
              Sauraha Nepal
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Your complete guide to Sauraha — the gateway to Chitwan National Park.
              Find the best stays, food, activities, and local experiences.
            </p>
            {(showFacebook || showInstagram) && (
              <div className="mt-3 flex gap-3">
                {showFacebook && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex text-white transition-colors hover:text-orange-400"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {showInstagram && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex text-white transition-colors hover:text-orange-400"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Business" links={businessLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <div>
            <h4 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
              Newsletter
            </h4>
            <p className="text-sm leading-relaxed text-white/60">
              Travel tips and Chitwan updates — subscribe on our{" "}
              <Link href="/#newsletter" className="text-orange-light hover:underline">
                homepage
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/40">
          © {new Date().getFullYear()} SaurahaNepal.com · Built with 💚 for travellers
          exploring Sauraha
        </div>
      </div>
    </footer>
  )
}
