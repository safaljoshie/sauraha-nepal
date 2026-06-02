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
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/list-your-business", label: "List Your Business" },
]

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-white/70 transition-colors hover:text-orange-light"
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
              className="text-sm text-white/60 transition-colors hover:text-orange-light"
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

  const socials = [
    {
      key: "facebook",
      href: settings.facebook_url,
      label: "Facebook",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      href: settings.instagram_url,
      label: "Instagram",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      href: settings.twitter_url,
      label: "Twitter/X",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      href: settings.tiktok_url,
      label: "TikTok",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.16 8.16 0 004.77 1.52V6.56a4.85 4.85 0 01-1.1-.13z" />
        </svg>
      ),
    },
    {
      key: "youtube",
      href: settings.youtube_url,
      label: "YouTube",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ].filter((s) => s.href.trim().length > 0)

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
            {socials.length > 0 && (
              <div className="mt-6 flex gap-4">
                {socials.map((social) => (
                  <SocialIcon key={social.key} href={social.href} label={social.label}>
                    {social.icon}
                  </SocialIcon>
                ))}
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
