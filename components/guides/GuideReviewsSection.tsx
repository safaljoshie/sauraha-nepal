"use client"

import { useEffect, useState } from "react"
import GuideStarRating from "@/components/guides/GuideStarRating"
import EmailOtpVerification, {
  getVerifiedEmailFromSession,
  isEmailVerifiedInSession,
} from "@/components/EmailOtpVerification"
import { TOUR_TYPE_OPTIONS, type GuideReview } from "@/lib/tour-guides"
import { useRecaptchaToken } from "@/lib/use-recaptcha-token"

type GuideReviewFormProps = {
  guideId: string
}

export default function GuideReviewForm({ guideId }: GuideReviewFormProps) {
  const getRecaptchaToken = useRecaptchaToken()
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [reviewerCountry, setReviewerCountry] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [tourType, setTourType] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (isEmailVerifiedInSession("review_submit", guideId)) {
      setEmailVerified(true)
      const storedEmail = getVerifiedEmailFromSession("review_submit", guideId)
      if (storedEmail) setReviewerEmail(storedEmail)
    }
  }, [guideId])

  async function submitReview(verifiedEmail: string) {
    const recaptchaToken = await getRecaptchaToken("guide_review")
    if (!recaptchaToken) {
      setMessage({ type: "error", text: "We couldn't verify you're human. Please try again." })
      return
    }

    const res = await fetch("/api/guide-reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guide_id: guideId,
        reviewer_name: reviewerName.trim(),
        reviewer_email: verifiedEmail,
        reviewer_country: reviewerCountry.trim() || undefined,
        rating,
        comment: comment.trim(),
        tour_type: tourType || undefined,
        visit_date: visitDate.trim() || undefined,
        recaptchaToken,
      }),
    })
    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Could not submit review." })
      return
    }
    setMessage({
      type: "success",
      text: "Thank you! Your review has been submitted and will appear after approval.",
    })
    setReviewerName("")
    setReviewerEmail("")
    setReviewerCountry("")
    setRating(0)
    setTourType("")
    setVisitDate("")
    setComment("")
    setShowOtpStep(false)
    setEmailVerified(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setMessage(null)

    if (!reviewerName.trim()) {
      setMessage({ type: "error", text: "Please enter your name." })
      return
    }
    if (!reviewerEmail.trim()) {
      setMessage({ type: "error", text: "Please provide your email to submit a review." })
      return
    }
    if (rating < 1) {
      setMessage({ type: "error", text: "Please select a star rating." })
      return
    }
    if (comment.trim().length < 20) {
      setMessage({ type: "error", text: "Your review must be at least 20 characters." })
      return
    }

    if (!emailVerified) {
      setShowOtpStep(true)
      return
    }

    setSubmitting(true)
    try {
      await submitReview(reviewerEmail.trim().toLowerCase())
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifiedEmail(email: string) {
    setReviewerEmail(email)
    setEmailVerified(true)
    setShowOtpStep(false)
    setSubmitting(true)
    try {
      await submitReview(email)
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
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-text-mid">
          Your name *
          <input
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-text-mid">
          Your email *
          <input
            type="email"
            value={reviewerEmail}
            onChange={(e) => {
              setReviewerEmail(e.target.value)
              setEmailVerified(false)
              setShowOtpStep(false)
            }}
            className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
            required
            disabled={submitting}
          />
        </label>
        <label className="block text-sm font-semibold text-text-mid">
          Country (optional)
          <input
            value={reviewerCountry}
            onChange={(e) => setReviewerCountry(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
          />
        </label>
      </div>

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

      {showOtpStep && !emailVerified ? (
        <div className="mt-4 rounded-xl border border-border-brand bg-cream/60 p-4">
          <EmailOtpVerification
            purpose="review_submit"
            referenceId={guideId}
            recaptchaAction="review_submit"
            title="Verify your email to submit"
            description="We'll send a 6-digit code to confirm your email before publishing your review."
            compact
            initialEmail={reviewerEmail}
            onVerified={(email) => void handleVerifiedEmail(email)}
          />
        </div>
      ) : null}

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
        disabled={submitting || showOtpStep}
        className="mt-4 rounded-xl bg-green-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid disabled:opacity-60"
      >
        {submitting ? "Submitting…" : emailVerified ? "Submit review" : "Continue to email verification"}
      </button>
    </form>
  )
}

type GuideReviewsSectionProps = {
  guideId: string
  avgRating: number
  reviewCount: number
  reviews: GuideReview[]
}

export function GuideReviewsSection({
  guideId,
  avgRating,
  reviewCount,
  reviews,
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

      <GuideReviewForm guideId={guideId} />
    </section>
  )
}
