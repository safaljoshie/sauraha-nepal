"use client"

import { useState, type FormEvent } from "react"

export default function HomeNewsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "done">("idle")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    window.location.href = `/contact?subject=Newsletter&email=${encodeURIComponent(trimmed)}`
    setStatus("done")
  }

  return (
    <section
      id="newsletter"
      className="home-section scroll-mt-24 border-t border-black/8 !py-8 md:!py-24"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-2xl px-4 text-center md:px-0">
        <h2
          id="newsletter-heading"
          className="font-heading text-xl font-bold tracking-tight text-ink md:text-[clamp(1.75rem,4vw,2.5rem)]"
        >
          Discover somewhere new
        </h2>
        <p className="mt-2 text-sm leading-snug text-ink-muted md:mt-4 md:text-base">
          Travel tips, new listings, and Chitwan inspiration — delivered to your inbox.
        </p>
        {status === "done" ? (
          <p className="mt-4 text-sm font-semibold text-green-brand md:mt-8 md:text-base">
            Thanks — we&apos;ll be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-row items-stretch justify-center gap-2 md:mt-8 md:gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green-brand md:max-w-sm md:px-5 md:py-3.5 md:text-base"
              autoComplete="email"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-green-brand px-4 py-2.5 text-xs font-bold tracking-wide text-white uppercase hover:bg-green-mid md:px-8 md:py-3.5 md:text-sm"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
