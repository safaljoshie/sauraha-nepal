"use client"

import { useEffect, useState } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import EmailOtpVerification, {
  isEmailVerifiedInSession,
} from "@/components/EmailOtpVerification"
import {
  formatGuidePhoneUrl,
  formatGuideWhatsAppUrl,
} from "@/lib/tour-guides"

export type GuideContactInfo = {
  id: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  facebook_url: string | null
  instagram_url: string | null
  website_url: string | null
}

type GuideContactSectionProps = {
  guide: GuideContactInfo
  variant?: "card" | "inline"
}

function useGuideContactVerified(guideId: string) {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const check = () => {
      setVerified(isEmailVerifiedInSession("guide_contact", guideId))
    }
    check()
    const onVerified = (event: Event) => {
      const detail = (event as CustomEvent<{ guideId: string }>).detail
      if (detail?.guideId === guideId) setVerified(true)
    }
    window.addEventListener("guide-contact-verified", onVerified)
    return () => window.removeEventListener("guide-contact-verified", onVerified)
  }, [guideId])

  return verified
}

export default function GuideContactSection({
  guide,
  variant = "card",
}: GuideContactSectionProps) {
  const verified = useGuideContactVerified(guide.id)

  const hasPrivateContacts = Boolean(guide.phone || guide.whatsapp || guide.email)
  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""
  const callUrl = guide.phone ? formatGuidePhoneUrl(guide.phone) : ""

  const wrapperClass =
    variant === "card"
      ? "rounded-2xl border border-border-brand bg-white p-5"
      : ""

  if (!hasPrivateContacts) {
    return (
      <section className={wrapperClass}>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
          Contact
        </h2>
        <div className="mt-4">
          <PublicLinks guide={guide} />
        </div>
      </section>
    )
  }

  if (!verified) {
    return (
      <section className={wrapperClass}>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
          Contact
        </h2>
        <div className="mt-4 rounded-xl border border-border-brand bg-cream/60 p-5">
          <EmailOtpVerification
            purpose="guide_contact"
            referenceId={guide.id}
            recaptchaAction="guide_contact"
            title="Verify your email to see contact details"
            description="Enter your email to view this guide's phone, WhatsApp, and email. We'll send you a quick verification code."
            onVerified={() => {}}
          />
        </div>
      </section>
    )
  }

  return (
    <section className={wrapperClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
          Contact
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-mid/15 px-3 py-1 text-xs font-bold text-green-brand">
          <SiteIcon name="check" size={14} />
          Verified — contact details unlocked
        </span>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {guide.phone ? (
          <li>
            <a
              href={callUrl}
              className="inline-flex items-center gap-2 font-semibold text-green-brand transition-colors hover:text-green-mid hover:underline"
            >
              <SiteIcon name="phone" size={20} strokeWidth={2.25} className="shrink-0" />
              {guide.phone}
            </a>
          </li>
        ) : null}
        {guide.whatsapp ? (
          <li>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-green-brand transition-colors hover:text-green-mid hover:underline"
            >
              <SiteIcon name="message-circle" size={20} strokeWidth={2.25} className="shrink-0" />
              {guide.whatsapp}
            </a>
          </li>
        ) : null}
        {guide.email ? (
          <li>
            <a
              href={`mailto:${guide.email}`}
              className="inline-flex items-center gap-2 font-semibold text-green-brand transition-colors hover:text-green-mid hover:underline"
            >
              <SiteIcon name="mail" size={20} strokeWidth={2.25} className="shrink-0" />
              {guide.email}
            </a>
          </li>
        ) : null}
        <PublicLinks guide={guide} list />
      </ul>
    </section>
  )
}

export function GuideContactActions({
  guide,
  className = "",
}: {
  guide: GuideContactInfo
  className?: string
}) {
  const verified = useGuideContactVerified(guide.id)

  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""
  const callUrl = guide.phone ? formatGuidePhoneUrl(guide.phone) : ""

  if (!verified || (!waUrl && !callUrl)) return null

  return (
    <div className={`flex gap-3 ${className}`}>
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-brand px-6 py-3 text-sm font-bold text-white hover:bg-green-mid"
        >
          Contact on WhatsApp
        </a>
      ) : null}
      {callUrl ? (
        <a
          href={callUrl}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-green-brand px-6 py-3 text-sm font-bold text-green-brand hover:bg-green-brand/5"
        >
          Call
        </a>
      ) : null}
    </div>
  )
}

export function GuideStickyCtaGate({ guide }: { guide: GuideContactInfo }) {
  const verified = useGuideContactVerified(guide.id)

  const waUrl = guide.whatsapp ? formatGuideWhatsAppUrl(guide.whatsapp) : ""
  const callUrl = guide.phone ? formatGuidePhoneUrl(guide.phone) : ""

  if (!verified || (!waUrl && !callUrl)) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-brand bg-white/95 p-3 backdrop-blur md:hidden mobile-bottom-nav-clearance">
      <div className="site-container flex gap-2">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-brand px-4 py-3 text-sm font-bold text-white"
          >
            Contact on WhatsApp
          </a>
        ) : null}
        {callUrl ? (
          <a
            href={callUrl}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-green-brand px-4 py-3 text-sm font-bold text-green-brand"
          >
            Call
          </a>
        ) : null}
      </div>
    </div>
  )
}

function PublicLinks({
  guide,
  list = false,
}: {
  guide: GuideContactInfo
  list?: boolean
}) {
  const items = [
    guide.facebook_url
      ? { href: guide.facebook_url, label: "Facebook", external: true, icon: "facebook" as const }
      : null,
    guide.instagram_url
      ? { href: guide.instagram_url, label: "Instagram", external: true, icon: "instagram" as const }
      : null,
    guide.website_url
      ? { href: guide.website_url, label: "Website", external: true, icon: "globe" as const }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    external: boolean
    icon: "facebook" | "instagram" | "globe"
  }>

  if (items.length === 0) return null

  if (list) {
    return (
      <>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 font-semibold text-green-brand transition-colors hover:text-green-mid hover:underline"
            >
              {item.icon === "facebook" ? <FacebookIcon /> : null}
              {item.icon === "instagram" ? <InstagramIcon /> : null}
              {item.icon === "globe" ? (
                <SiteIcon name="globe" size={20} strokeWidth={2.25} className="shrink-0" />
              ) : null}
              {item.label}
            </a>
          </li>
        ))}
      </>
    )
  }

  return (
    <ul className="space-y-3 text-sm">
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 font-semibold text-green-brand transition-colors hover:text-green-mid hover:underline"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
      className="shrink-0"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
