"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { BusinessReviewWithListing } from "@/lib/business-reviews"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
]

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-mid/15 text-green-brand"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-orange-brand/15 text-orange-brand"
  }
}

export default function AdminBusinessReviewsSection() {
  const [reviews, setReviews] = useState<BusinessReviewWithListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/business-reviews")
      if (!res.ok) {
        setError("Failed to load reviews.")
        return
      }
      const data = (await res.json()) as { reviews?: BusinessReviewWithListing[] }
      setReviews(data.reviews ?? [])
    } catch {
      setError("Failed to load reviews.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (filter === "all") return reviews
    return reviews.filter((r) => r.status === filter)
  }, [reviews, filter])

  async function updateStatus(review: BusinessReviewWithListing, status: string) {
    setActionId(review.id)
    try {
      const res = await fetch(`/api/admin/business-reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        setError("Could not update review.")
        return
      }
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)))
    } finally {
      setActionId(null)
    }
  }

  async function remove(review: BusinessReviewWithListing) {
    if (!confirm("Delete this review permanently?")) return
    setActionId(review.id)
    try {
      const res = await fetch(`/api/admin/business-reviews/${review.id}`, { method: "DELETE" })
      if (!res.ok) {
        setError("Could not delete review.")
        return
      }
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
        Business reviews
      </h3>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === tab.id ? "bg-green-brand text-white" : "bg-white text-text-mid hover:bg-cream"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold tracking-wide text-text-light uppercase">
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-light">
                    Loading reviews…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-light">
                    No reviews in this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <tr key={review.id} className="border-b border-border-brand last:border-0">
                    <td className="px-4 py-3">{review.business?.business_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {review.reviewer_name}
                      {review.reviewer_country ? (
                        <span className="text-text-light"> · {review.reviewer_country}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{review.rating}★</td>
                    <td className="max-w-xs truncate px-4 py-3 text-text-mid">{review.comment}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(review.status)}`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {review.status !== "approved" ? (
                          <button
                            type="button"
                            disabled={actionId === review.id}
                            onClick={() => updateStatus(review, "approved")}
                            className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                          >
                            ✓
                          </button>
                        ) : null}
                        {review.status !== "rejected" ? (
                          <button
                            type="button"
                            disabled={actionId === review.id}
                            onClick={() => updateStatus(review, "rejected")}
                            className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                          >
                            ✗
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={actionId === review.id}
                          onClick={() => remove(review)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
