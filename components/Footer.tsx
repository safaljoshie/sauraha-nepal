import Link from "next/link"
import type { ReactNode } from "react"
import { fetchSiteSettings } from "@/lib/site-settings"

const exploreLinks = [
  { href: "/listings", label: "All Listings" },
  { href: "/listings?category=stay", label: "Stay" },
  { href: "/listings?category=eat", label: "Eat & Drink" },
  { href: "/listings?category=activities", label: "Activities" },
]

const infoLinks = [
  { href: "/blog", label: "Travel Tips" },
  {
    href: "/blog/park-permits-to-visit-sauraha-community-forest-vs-national-forest-2026-guide",
    label: "Park Permits",
  },
  {
    href: "/blog/how-to-get-to-sauraha-from-kathmandu-and-pokhara-2026-travel-guide",
    label: "Getting Here",
  },
  { href: "/blog", label: "Blog" },
]

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/list-your-business", label: "List Your Business" },
]

function hasSocialUrl(url: string) {
  return url.trim().length > 0
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex text-white transition-colors hover:text-[#e8621a]"
    >
      {children}
    </a>
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
  const showFacebook = hasSocialUrl(facebookUrl)
  const showInstagram = hasSocialUrl(instagramUrl)

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
                  <SocialIconLink href={facebookUrl} label="Facebook">
                    <FacebookIcon />
                  </SocialIconLink>
                )}
                {showInstagram && (
                  <SocialIconLink href={instagramUrl} label="Instagram">
                    <InstagramIcon />
                  </SocialIconLink>
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
