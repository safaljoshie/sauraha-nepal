import Link from "next/link"
import { fetchSiteSettings } from "@/lib/site-settings"

const exploreLinks = [
  { href: "/listings", label: "All Listings" },
  { href: "/listings?category=stay", label: "Stay" },
  { href: "/listings?category=eat", label: "Eat & Drink" },
  { href: "/listings?category=activities", label: "Activities" },
]

const infoLinks = [
  { href: "/blog", label: "Travel Tips" },
  { href: "/blog/chitwan-national-park-entry-fees", label: "Park Permits" },
  { href: "/blog/how-to-get-to-sauraha", label: "Getting Here" },
  { href: "/blog", label: "Blog" },
]

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/list-your-business", label: "List Your Business" },
]

function isValidSocialUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function FacebookIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
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

export default async function Footer() {
  const settings = await fetchSiteSettings()

  const facebookUrl = settings.facebook_url.trim()
  const instagramUrl = settings.instagram_url.trim()
  const showFacebook = isValidSocialUrl(facebookUrl)
  const showInstagram = isValidSocialUrl(instagramUrl)

  return (
    <footer className="bg-text-brand px-8 py-14 text-white/75">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-xl text-white">
              Sauraha Nepal
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Your complete guide to Sauraha — the gateway to Chitwan National Park.
              Find the best stays, food, activities, and local experiences.
            </p>
            {(showFacebook || showInstagram) && (
              <div className="mt-6 flex items-center gap-4">
                {showFacebook && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex text-white/70 transition-colors hover:text-[#e8621a]"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {showInstagram && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex text-white/70 transition-colors hover:text-[#e8621a]"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            )}
          </div>
          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Info" links={infoLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/40">
          © {new Date().getFullYear()} SaurahaNePal.com · Built with ❤️ for travellers
          exploring Chitwan
        </div>
      </div>
    </footer>
  )
}
