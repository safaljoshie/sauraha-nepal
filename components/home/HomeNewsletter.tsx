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
      className="home-section border-t border-black/8 scroll-mt-24"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="newsletter-heading" className="nsw-section-title">
          Discover somewhere new
        </h2>
        <p className="mt-4 text-ink-muted">
          Travel tips, new listings, and Chitwan inspiration — delivered to your inbox.
        </p>
        {status === "done" ? (
          <p className="mt-8 font-semibold text-green-brand">Thanks — we&apos;ll be in touch.</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
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
              className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-5 py-3.5 text-ink outline-none focus:border-green-brand sm:max-w-sm"
              autoComplete="email"
            />
            <button
              type="submit"
              className="rounded-xl bg-green-brand px-8 py-3.5 text-sm font-bold tracking-wide text-white uppercase hover:bg-green-mid"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
