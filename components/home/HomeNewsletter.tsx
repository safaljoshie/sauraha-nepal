"use client"

import { useState, type FormEvent } from "react"
import { useT } from "@/components/i18n/LocaleProvider"

type SubmitStatus = "idle" | "loading" | "success" | "error"
type SubscribeResult = "pending" | "already_subscribed"

export default function HomeNewsletter() {
  const t = useT()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [result, setResult] = useState<SubscribeResult>("pending")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, name: name.trim() || undefined }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        status?: SubscribeResult
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.")
        setStatus("error")
        return
      }

      setResult(data.status === "already_subscribed" ? "already_subscribed" : "pending")
      setStatus("success")
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
      setStatus("error")
    }
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
          {t("home.newsletterTitle")}
        </h2>
        <p className="mt-2 text-sm leading-snug text-ink-muted md:mt-4 md:text-base">
          {t("home.newsletterSubtitle")}
        </p>
        {status === "success" ? (
          <p className="mt-4 text-sm font-semibold text-green-brand md:mt-8 md:text-base">
            {result === "already_subscribed"
              ? "You're already subscribed to our newsletter!"
              : "Almost there! Check your email to confirm your subscription."}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-4 flex max-w-md flex-col items-stretch gap-2 md:mt-8 md:gap-3"
          >
            <label htmlFor="newsletter-name" className="sr-only">
              {t("home.newsletterName")}
            </label>
            <input
              id="newsletter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("home.newsletterName")}
              className="min-w-0 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green-brand md:px-5 md:py-3.5 md:text-base"
              autoComplete="name"
              disabled={status === "loading"}
            />
            <div className="flex flex-row items-stretch gap-2 md:gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                {t("home.newsletterEmail")}
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("home.newsletterEmail")}
                className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green-brand md:px-5 md:py-3.5 md:text-base"
                autoComplete="email"
                disabled={status === "loading"}
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-green-brand px-4 py-2.5 text-xs font-bold tracking-wide text-white uppercase hover:bg-green-mid md:px-8 md:py-3.5 md:text-sm disabled:opacity-60"
                disabled={status === "loading"}
              >
                {status === "loading" ? t("home.newsletterSubscribing") : t("home.newsletterSubscribe")}
              </button>
            </div>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  )
}
