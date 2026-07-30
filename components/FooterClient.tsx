"use client"

import Link from "next/link"
import { useT } from "@/components/i18n/LocaleProvider"
import type { CategoryCatalog } from "@/lib/category-catalog"
import { buildFooterExploreLinks } from "@/lib/category-catalog"

const businessHrefs = [
  { href: "/list-your-business", key: "footer.listYourBusiness" },
  { href: "/claim-listing", key: "footer.claimYourListing" },
  { href: "/contact", key: "footer.advertising" },
] as const

const companyHrefs = [
  { href: "/about", key: "footer.about" },
  { href: "/contact", key: "footer.contact" },
] as const

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">{title}</h4>
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

type FooterClientProps = {
  catalog: CategoryCatalog
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
}

export default function FooterClient({
  catalog,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: FooterClientProps) {
  const t = useT()
  const exploreLinks = buildFooterExploreLinks(catalog)
  const showFacebook = facebookUrl.trim().length > 0
  const showInstagram = instagramUrl.trim().length > 0
  const showTikTok = tiktokUrl.trim().length > 0
  const year = new Date().getFullYear()

  return (
    <footer className="bg-text-brand py-14 text-white/75 max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="site-container">
        <div className="mb-10 grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-xl text-white">
              {t("footer.brand")}
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{t("footer.tagline")}</p>
            {(showFacebook || showInstagram || showTikTok) && (
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
                {showTikTok && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="inline-flex text-white transition-colors hover:text-orange-400"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
          <FooterColumn title={t("footer.explore")} links={exploreLinks} />
          <FooterColumn
            title={t("footer.business")}
            links={businessHrefs.map((l) => ({ href: l.href, label: t(l.key) }))}
          />
          <FooterColumn
            title={t("footer.company")}
            links={companyHrefs.map((l) => ({ href: l.href, label: t(l.key) }))}
          />
          <FooterColumn
            title={t("footer.legal")}
            links={[{ href: "/privacy-policy", label: t("footer.privacyPolicy") }]}
          />
          <div>
            <h4 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
              {t("footer.newsletter")}
            </h4>
            <p className="text-sm leading-relaxed text-white/60">
              {t("footer.newsletterBlurbBefore")}
              <Link href="/#newsletter" className="text-orange-light hover:underline">
                {t("footer.newsletterHomepage")}
              </Link>
              {t("footer.newsletterBlurbAfter")}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/40">
          {t("footer.copyright", { year })}
          <p className="mt-2 text-[11px] text-white/40">
            {t("footer.recaptchaBefore")}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-white/70"
            >
              {t("footer.recaptchaPrivacy")}
            </a>
            {t("footer.recaptchaAnd")}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-white/70"
            >
              {t("footer.recaptchaTerms")}
            </a>
            {t("footer.recaptchaAfter")}
          </p>
        </div>
      </div>
    </footer>
  )
}
