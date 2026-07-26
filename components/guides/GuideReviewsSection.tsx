"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import GuideStarRating from "@/components/guides/GuideStarRating"
import { useRecaptchaToken } from "@/lib/use-recaptcha-token"
import { useToast } from "@/components/ui/ToastProvider"
import { TOUR_TYPE_OPTIONS, type GuideReview } from "@/lib/tour-guides"

type GuideReviewFormProps = {
  guideId: string
  signedIn: boolean
}

export default function GuideReviewForm({ guideId, signedIn }: GuideReviewFormProps) {
  const pathname = usePathname()
  const getRecaptchaToken = useRecaptchaToken()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [tourType, setTourType] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-border-brand bg-white p-6 text-center">
        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
          Write a review
        </h3>
        <p className="mt-2 text-sm text-text-mid">
          Sign in to share your experience with this guide.
        </p>
        <Link
          href={`/signin?next=${encodeURIComponent(pathname)}`}
          className="mt-4 inline-block rounded-xl bg-green-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid"
        >
          Sign in to write a review
        </Link>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)

    if (rating < 1) {
      setMessage({ type: "error", text: "Please select a star rating." })
      return
    }
    if (comment.trim().length < 20) {
      setMessage({ type: "error", text: "Your review must be at least 20 characters." })
      return
    }

    setSubmitting(true)
    try {
      const recaptchaToken = await getRecaptchaToken("guide_review")
      const res = await fetch("/api/guide-reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide_id: guideId,
          rating,
          comment: comment.trim(),
          tour_type: tourType || undefined,
          visit_date: visitDate.trim() || undefined,
          recaptchaToken,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (res.status === 429) {
        toast(data.error ?? "You're doing that too fast. Please try again shortly.", "error")
        return
      }
      if (res.status === 401) {
        toast("Please sign in to leave a review.", "error")
        return
      }
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not submit review." })
        return
      }
      setMessage({
        type: "success",
        text: "Thank you! Your review has been submitted and will appear after approval.",
      })
      setRating(0)
      setTourType("")
      setVisitDate("")
      setComment("")
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border-brand bg-white p-5">
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-text-brand">
        Write a review
      </h3>

      <div className="mt-4">
        <p className="text-sm font-semibold text-text-mid">Your rating *</p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1
            const active = displayRating >= value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl transition-colors ${active ? "text-orange-brand" : "text-border-brand"}`}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                ★
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-text-mid">
          Tour type
          <select
            value={tourType}
            onChange={(e) => setTourType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm outline-none focus:border-green-mid"
          >
            <option value="">Select tour type</option>
            {TOUR_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-text-mid">
          Visit date (approximate)
          <input
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            placeholder="e.g. March 2026"
            className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold text-text-mid">
        Your review * (min 20 characters)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
          required
          minLength={20}
        />
      </label>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-mid/15 text-green-brand"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-green-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  )
}

type GuideReviewsSectionProps = {
  guideId: string
  avgRating: number
  reviewCount: number
  reviews: GuideReview[]
  signedIn: boolean
}

export function GuideReviewsSection({
  guideId,
  avgRating,
  reviewCount,
  reviews,
  signedIn,
}: GuideReviewsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(5)
  const visibleReviews = reviews.slice(0, visibleCount)

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    const percent = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
    return { stars, count, percent }
  })

  return (
    <section className="space-y-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-text-brand">
        Reviews
      </h2>

      <div className="grid gap-6 rounded-2xl border border-border-brand bg-white p-5 md:grid-cols-2">
        <div>
          <p className="text-4xl font-bold text-text-brand">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </p>
          <GuideStarRating rating={avgRating} size="md" className="mt-2" />
          <p className="mt-2 text-sm text-text-light">
            {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-2">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-text-mid">{row.stars}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-orange-brand"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-8 text-right text-text-light">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-text-light">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-border-brand bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-text-brand">
                  {review.reviewer_name}
                  {review.reviewer_country ? (
                    <span className="font-normal text-text-light"> · {review.reviewer_country}</span>
                  ) : null}
                </p>
                <GuideStarRating rating={review.rating} />
              </div>
              {review.tour_type ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-brand">
                  {review.tour_type}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-text-mid">{review.comment}</p>
            </article>
          ))}
          {reviews.length > visibleCount ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 5)}
              className="rounded-xl border border-border-brand bg-white px-5 py-2.5 text-sm font-semibold text-green-brand hover:bg-cream"
            >
              Load more
            </button>
          ) : null}
        </div>
      )}

      <GuideReviewForm guideId={guideId} signedIn={signedIn} />
    </section>
  )
}
