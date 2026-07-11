"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import {
  COMMON_EXPERTISE,
  COMMON_LANGUAGES,
  type GuideReview,
  type GuideService,
  type GuideStatus,
  type TourGuide,
} from "@/lib/tour-guides"

type Toast = { id: string; type: "success" | "error"; message: string }

type ReviewRow = GuideReview & { guide?: { id: string; full_name: string } }

type GuideFormState = {
  id: string | null
  full_name: string
  nickname: string
  photo_url: string
  bio: string
  years_experience: string
  location: string
  phone: string
  whatsapp: string
  email: string
  facebook_url: string
  instagram_url: string
  website_url: string
  licence_number: string
  licence_verified: boolean
  languages: string[]
  expertise: string[]
  services: GuideService[]
  status: GuideStatus
  meta_title: string
  meta_description: string
}

const EMPTY_FORM: GuideFormState = {
  id: null,
  full_name: "",
  nickname: "",
  photo_url: "",
  bio: "",
  years_experience: "",
  location: "Sauraha, Chitwan",
  phone: "",
  whatsapp: "",
  email: "",
  facebook_url: "",
  instagram_url: "",
  website_url: "",
  licence_number: "",
  licence_verified: false,
  languages: [],
  expertise: [],
  services: [],
  status: "pending",
  meta_title: "",
  meta_description: "",
}

const FILTER_TABS: { id: GuideStatus | "all"; label: string }[] = [
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
      return "bg-yellow-100 text-yellow-800"
  }
}

function guideToForm(guide: TourGuide): GuideFormState {
  return {
    id: guide.id,
    full_name: guide.full_name,
    nickname: guide.nickname ?? "",
    photo_url: guide.photo_url ?? "",
    bio: guide.bio ?? "",
    years_experience: guide.years_experience != null ? String(guide.years_experience) : "",
    location: guide.location ?? "Sauraha, Chitwan",
    phone: guide.phone ?? "",
    whatsapp: guide.whatsapp ?? "",
    email: guide.email ?? "",
    facebook_url: guide.facebook_url ?? "",
    instagram_url: guide.instagram_url ?? "",
    website_url: guide.website_url ?? "",
    licence_number: guide.licence_number ?? "",
    licence_verified: guide.licence_verified,
    languages: [...guide.languages],
    expertise: [...guide.expertise],
    services: guide.services.length > 0 ? guide.services.map((s) => ({ ...s })) : [],
    status: guide.status,
    meta_title: guide.meta_title ?? "",
    meta_description: guide.meta_description ?? "",
  }
}

export default function AdminGuidesSection() {
  const router = useRouter()
  const [guides, setGuides] = useState<TourGuide[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [filter, setFilter] = useState<GuideStatus | "all">("all")
  const [reviewFilter, setReviewFilter] = useState<GuideStatus | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<GuideFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [customLanguage, setCustomLanguage] = useState("")
  const [customExpertise, setCustomExpertise] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  const loadGuides = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/guides")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { guides?: TourGuide[] }
      setGuides(data.guides ?? [])
    } catch {
      showToast("error", "Failed to load guides.")
    } finally {
      setLoading(false)
    }
  }, [router])

  const loadReviews = useCallback(async () => {
    setReviewLoading(true)
    try {
      const res = await fetch("/api/admin/guide-reviews")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { reviews?: ReviewRow[] }
      setReviews(data.reviews ?? [])
    } catch {
      showToast("error", "Failed to load reviews.")
    } finally {
      setReviewLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadGuides()
    loadReviews()
  }, [loadGuides, loadReviews])

  const filteredGuides = useMemo(() => {
    if (filter === "all") return guides
    return guides.filter((g) => g.status === filter)
  }, [guides, filter])

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews
    return reviews.filter((r) => r.status === reviewFilter)
  }, [reviews, reviewFilter])

  const stats = useMemo(() => {
    const total = guides.length
    const pending = guides.filter((g) => g.status === "pending").length
    const approved = guides.filter((g) => g.status === "approved").length
    const rejected = guides.filter((g) => g.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [guides])

  function openCreate() {
    setForm({ ...EMPTY_FORM, services: [{ name: "", price_npr: 0, description: "" }] })
    setFormOpen(true)
  }

  function openEdit(guide: TourGuide) {
    setForm(guideToForm(guide))
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setForm(EMPTY_FORM)
    setCustomLanguage("")
    setCustomExpertise("")
  }

  function toggleArrayItem(field: "languages" | "expertise", value: string) {
    setForm((prev) => {
      const set = new Set(prev[field])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...prev, [field]: [...set] }
    })
  }

  function addCustomTag(field: "languages" | "expertise", value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setForm((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], trimmed])],
    }))
    if (field === "languages") setCustomLanguage("")
    else setCustomExpertise("")
  }

  function updateService(index: number, patch: Partial<GuideService>) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, ...patch } : service,
      ),
    }))
  }

  function addServiceRow() {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price_npr: 0, description: "" }],
    }))
  }

  function removeServiceRow(index: number) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }))
  }

  async function handlePhotoUpload(file: File) {
    const guideId = form.id ?? crypto.randomUUID()
    if (!form.id) setForm((prev) => ({ ...prev, id: guideId }))

    setUploadingPhoto(true)
    try {
      const body = new FormData()
      body.append("guideId", guideId)
      body.append("file", file)
      const res = await fetch("/api/admin/guides/upload-photo", { method: "POST", body })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { url?: string; error?: string; saved?: boolean }
      if (!res.ok || !data.url) {
        showToast("error", data.error ?? "Photo upload failed.")
        return
      }
      setForm((prev) => ({ ...prev, photo_url: data.url!, id: guideId }))
      if (data.saved) {
        setGuides((prev) =>
          prev.map((g) => (g.id === guideId ? { ...g, photo_url: data.url! } : g)),
        )
        showToast("success", "Photo uploaded and saved")
      } else {
        showToast("success", "Photo uploaded")
      }
    } catch {
      showToast("error", "Photo upload failed.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      showToast("error", "Full name is required.")
      return
    }
    if (!form.bio.trim()) {
      showToast("error", "Bio is required.")
      return
    }

    if (!form.phone.trim()) {
      showToast("error", "Phone is required.")
      return
    }

    setSaving(true)
    const payload = {
      ...(form.id && !guides.some((g) => g.id === form.id) ? { id: form.id } : {}),
      full_name: form.full_name,
      nickname: form.nickname,
      photo_url: form.photo_url,
      bio: form.bio,
      years_experience: form.years_experience,
      location: form.location,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      website_url: form.website_url,
      licence_number: form.licence_number,
      licence_verified: form.licence_verified,
      languages: form.languages,
      expertise: form.expertise,
      services: form.services.filter((s) => s.name.trim()),
      status: form.status,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
    }

    try {
      const isEdit = Boolean(form.id && guides.some((g) => g.id === form.id))
      const res = await fetch(isEdit ? `/api/admin/guides/${form.id}` : "/api/admin/guides", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { guide?: TourGuide; error?: string }
      if (!res.ok || !data.guide) {
        showToast("error", data.error ?? "Failed to save guide.")
        return
      }
      setGuides((prev) => {
        const exists = prev.some((g) => g.id === data.guide!.id)
        return exists
          ? prev.map((g) => (g.id === data.guide!.id ? data.guide! : g))
          : [data.guide!, ...prev]
      })
      showToast("success", isEdit ? "Guide updated" : "Guide created")
      closeForm()
    } catch {
      showToast("error", "Failed to save guide.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleVerify(guide: TourGuide) {
    setActionId(guide.id)
    try {
      const res = await fetch(`/api/admin/guides/${guide.id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: !guide.is_verified }),
      })
      const data = (await res.json()) as { guide?: TourGuide; error?: string }
      if (!res.ok || !data.guide) {
        showToast("error", data.error ?? "Failed to update verification.")
        return
      }
      setGuides((prev) => prev.map((g) => (g.id === guide.id ? data.guide! : g)))
      showToast("success", data.guide.is_verified ? "Guide verified" : "Verification removed")
    } catch {
      showToast("error", "Failed to update verification.")
    } finally {
      setActionId(null)
    }
  }

  async function deleteGuide(guide: TourGuide) {
    if (!window.confirm(`Delete ${guide.full_name}? This cannot be undone.`)) return
    setActionId(guide.id)
    try {
      const res = await fetch(`/api/admin/guides/${guide.id}`, { method: "DELETE" })
      if (!res.ok) {
        showToast("error", "Failed to delete guide.")
        return
      }
      setGuides((prev) => prev.filter((g) => g.id !== guide.id))
      showToast("success", "Guide deleted")
    } catch {
      showToast("error", "Failed to delete guide.")
    } finally {
      setActionId(null)
    }
  }

  async function handleGuideAction(guideId: string, action: "approve" | "reject") {
    setActionId(guideId)
    const nextStatus = action === "approve" ? "approved" : "rejected"
    const previousGuides = guides
    setGuides((prev) =>
      prev.map((g) => (g.id === guideId ? { ...g, status: nextStatus } : g)),
    )
    try {
      const res = await fetch(`/api/admin/guides/${guideId}/${action}`, { method: "POST" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { guide?: TourGuide; error?: string }
      if (!res.ok || !data.guide) {
        setGuides(previousGuides)
        showToast("error", data.error ?? `Failed to ${action} guide.`)
        return
      }
      setGuides((prev) => prev.map((g) => (g.id === guideId ? data.guide! : g)))
      showToast("success", `Guide ${action}d successfully`)
    } catch {
      setGuides(previousGuides)
      showToast("error", `Failed to ${action} guide. Please try again.`)
    } finally {
      setActionId(null)
    }
  }

  async function updateReviewStatus(review: ReviewRow, status: GuideStatus) {
    setActionId(review.id)
    try {
      const res = await fetch(`/api/admin/guide-reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        showToast("error", "Failed to update review.")
        return
      }
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)))
      await loadGuides()
      showToast("success", status === "approved" ? "Review approved" : "Review rejected")
    } catch {
      showToast("error", "Failed to update review.")
    } finally {
      setActionId(null)
    }
  }

  async function deleteReview(review: ReviewRow) {
    if (!window.confirm("Delete this review?")) return
    setActionId(review.id)
    try {
      const res = await fetch(`/api/admin/guide-reviews/${review.id}`, { method: "DELETE" })
      if (!res.ok) {
        showToast("error", "Failed to delete review.")
        return
      }
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
      await loadGuides()
      showToast("success", "Review deleted")
    } catch {
      showToast("error", "Failed to delete review.")
    } finally {
      setActionId(null)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
            Tour Guides
            {stats.pending > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">
                {stats.pending} pending
              </span>
            ) : null}
          </h2>
          <p className="mt-1 text-sm text-text-light">
            Manage individual licensed guide profiles (separate from business listings)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-green-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-mid"
        >
          Add guide
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total guides", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border-brand bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">
              {stat.label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
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

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Languages</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-light">
                    Loading guides…
                  </td>
                </tr>
              ) : filteredGuides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-light">
                    No guides in this filter.
                  </td>
                </tr>
              ) : (
                filteredGuides.map((guide) => (
                  <tr key={guide.id} className="border-b border-border-brand last:border-0">
                    <td className="px-4 py-3">
                      {guide.photo_url ? (
                        <Image
                          src={guide.photo_url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-brand/10 text-xs font-bold text-green-brand">
                          {guide.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-brand">{guide.full_name}</td>
                    <td className="px-4 py-3 text-text-mid">{guide.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-text-mid">
                      {guide.languages.slice(0, 2).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(guide.status)}`}>
                        {guide.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{guide.is_verified ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-text-mid">
                      {guide.avg_rating > 0 ? `${guide.avg_rating} (${guide.review_count})` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          title="Approve"
                          disabled={actionId === guide.id || guide.status === "approved"}
                          onClick={() => handleGuideAction(guide.id, "approve")}
                          className="admin-listings-action-btn cursor-pointer rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          title="Reject"
                          disabled={actionId === guide.id || guide.status === "rejected"}
                          onClick={() => handleGuideAction(guide.id, "reject")}
                          className="admin-listings-action-btn cursor-pointer rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✗
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(guide)}
                          className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          disabled={actionId === guide.id}
                          onClick={() => toggleVerify(guide)}
                          className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                          title={guide.is_verified ? "Unverify" : "Verify"}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          disabled={actionId === guide.id}
                          onClick={() => deleteGuide(guide)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          🗑
                        </button>
                        {guide.status === "approved" ? (
                          <Link
                            href={`/guides/${guide.id}`}
                            target="_blank"
                            className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                          >
                            View
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
          Guide reviews
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={`review-${tab.id}`}
              type="button"
              onClick={() => setReviewFilter(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                reviewFilter === tab.id
                  ? "bg-green-brand text-white"
                  : "bg-white text-text-mid hover:bg-cream"
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
                <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                  <th className="px-4 py-3">Guide</th>
                  <th className="px-4 py-3">Reviewer</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-light">
                      Loading reviews…
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-light">
                      No reviews in this filter.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-border-brand last:border-0">
                      <td className="px-4 py-3">{review.guide?.full_name ?? "—"}</td>
                      <td className="px-4 py-3">{review.reviewer_name}</td>
                      <td className="px-4 py-3">{review.rating}★</td>
                      <td className="max-w-xs truncate px-4 py-3 text-text-mid">{review.comment}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(review.status)}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {review.status !== "approved" ? (
                            <button
                              type="button"
                              disabled={actionId === review.id}
                              onClick={() => updateReviewStatus(review, "approved")}
                              className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                            >
                              ✓
                            </button>
                          ) : null}
                          {review.status !== "rejected" ? (
                            <button
                              type="button"
                              disabled={actionId === review.id}
                              onClick={() => updateReviewStatus(review, "rejected")}
                              className="rounded-lg border border-border-brand px-2 py-1 text-xs font-semibold hover:bg-cream"
                            >
                              ✗
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={actionId === review.id}
                            onClick={() => deleteReview(review)}
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

      {formOpen ? (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                {form.id && guides.some((g) => g.id === form.id) ? "Edit guide" : "Add guide"}
              </h3>
              <button type="button" onClick={closeForm} aria-label="Close">
                <SiteIcon name="close" size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <FormSection title="Personal">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name *" value={form.full_name} onChange={(v) => setForm((p) => ({ ...p, full_name: v }))} />
                  <Field label="Nickname" value={form.nickname} onChange={(v) => setForm((p) => ({ ...p, nickname: v }))} />
                  <Field label="Years experience" value={form.years_experience} onChange={(v) => setForm((p) => ({ ...p, years_experience: v }))} type="number" />
                  <Field label="Location" value={form.location} onChange={(v) => setForm((p) => ({ ...p, location: v }))} />
                </div>
                <label className="mt-4 block text-sm font-semibold text-text-mid">
                  Photo
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handlePhotoUpload(file)
                      }}
                      disabled={uploadingPhoto}
                    />
                    {form.photo_url ? (
                      <Image src={form.photo_url} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                    ) : null}
                  </div>
                </label>
                <label className="mt-4 block text-sm font-semibold text-text-mid">
                  Bio / About *
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
                  />
                </label>
              </FormSection>

              <FormSection title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone *" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
                  <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))} />
                  <Field label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
                  <Field label="Facebook URL" value={form.facebook_url} onChange={(v) => setForm((p) => ({ ...p, facebook_url: v }))} />
                  <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => setForm((p) => ({ ...p, instagram_url: v }))} />
                  <Field label="Website URL" value={form.website_url} onChange={(v) => setForm((p) => ({ ...p, website_url: v }))} />
                </div>
              </FormSection>

              <FormSection title="Professional">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Licence number" value={form.licence_number} onChange={(v) => setForm((p) => ({ ...p, licence_number: v }))} />
                  <label className="block text-sm font-semibold text-text-mid">
                    Status
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as GuideStatus }))}
                      className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-text-mid">
                  <input
                    type="checkbox"
                    checked={form.licence_verified}
                    onChange={(e) => setForm((p) => ({ ...p, licence_verified: e.target.checked }))}
                  />
                  Licence verified
                </label>
              </FormSection>

              <FormSection title="Languages">
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map((lang) => (
                    <TagButton
                      key={lang}
                      active={form.languages.includes(lang)}
                      onClick={() => toggleArrayItem("languages", lang)}
                      label={lang}
                    />
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Add another language"
                    className="flex-1 rounded-xl border border-border-brand px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomTag("languages", customLanguage)}
                    className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </FormSection>

              <FormSection title="Expertise">
                <div className="flex flex-wrap gap-2">
                  {COMMON_EXPERTISE.map((tag) => (
                    <TagButton
                      key={tag}
                      active={form.expertise.includes(tag)}
                      onClick={() => toggleArrayItem("expertise", tag)}
                      label={tag}
                    />
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customExpertise}
                    onChange={(e) => setCustomExpertise(e.target.value)}
                    placeholder="Add another expertise"
                    className="flex-1 rounded-xl border border-border-brand px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomTag("expertise", customExpertise)}
                    className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </FormSection>

              <FormSection title="Services">
                {form.services.map((service, index) => (
                  <div key={index} className="mb-3 grid gap-2 rounded-xl border border-border-brand p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
                    <input
                      value={service.name}
                      onChange={(e) => updateService(index, { name: e.target.value })}
                      placeholder="Full-day jungle safari"
                      className="rounded-lg border border-border-brand px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={service.price_npr || ""}
                      onChange={(e) => updateService(index, { price_npr: Number(e.target.value) || 0 })}
                      placeholder="3500"
                      className="rounded-lg border border-border-brand px-3 py-2 text-sm"
                    />
                    <input
                      value={service.description ?? ""}
                      onChange={(e) => updateService(index, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="rounded-lg border border-border-brand px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => removeServiceRow(index)} className="text-sm text-red-700">
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addServiceRow} className="text-sm font-semibold text-green-brand">
                  + Add another service
                </button>
              </FormSection>

              <FormSection title="SEO">
                <Field
                  label={`Meta title (${form.meta_title.length}/60)`}
                  value={form.meta_title}
                  onChange={(v) => setForm((p) => ({ ...p, meta_title: v.slice(0, 60) }))}
                />
                <label className="mt-4 block text-sm font-semibold text-text-mid">
                  Meta description ({form.meta_description.length}/155)
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value.slice(0, 155) }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm"
                  />
                </label>
              </FormSection>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="rounded-xl border border-border-brand px-5 py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-green-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-green-mid disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save guide"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.type === "success" ? "bg-green-brand" : "bg-red-600"
            }`}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </section>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wide text-green-brand">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm font-semibold text-text-mid">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border-brand px-3 py-2.5 text-sm outline-none focus:border-green-mid"
      />
    </label>
  )
}

function TagButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-green-brand text-white" : "bg-cream text-text-mid hover:bg-green-mid/10"
      }`}
    >
      {label}
    </button>
  )
}
