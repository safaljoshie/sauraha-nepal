"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { BusinessListing } from "@/lib/business-listing"
import { formatSubmittedDate, planLabel } from "@/lib/business-listing"

type FilterTab =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "basic"
  | "featured"
  | "premium"

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "basic", label: "Basic" },
  { id: "featured", label: "Featured" },
  { id: "premium", label: "Premium" },
]

function planBadgeClass(plan: string) {
  switch (plan) {
    case "featured":
      return "bg-orange-brand/15 text-orange-brand"
    case "premium":
      return "bg-green-mid/15 text-green-brand"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

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

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="border-b border-border-brand py-3 last:border-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-text-light">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-text-brand">{value}</dd>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [listings, setListings] = useState<BusinessListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<BusinessListing | null>(null)

  const loadListings = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/listings")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as {
        listings?: BusinessListing[]
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Failed to load listings.")
        return
      }
      setListings(data.listings ?? [])
    } catch {
      setError("Failed to load listings.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  const stats = useMemo(() => {
    const total = listings.length
    const pending = listings.filter((l) => l.status === "pending").length
    const approved = listings.filter((l) => l.status === "approved").length
    const rejected = listings.filter((l) => l.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [listings])

  const filtered = useMemo(() => {
    if (filter === "all") return listings
    if (filter === "pending" || filter === "approved" || filter === "rejected") {
      return listings.filter((l) => l.status === filter)
    }
    return listings.filter((l) => l.plan === filter)
  }, [listings, filter])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
    router.refresh()
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionId(id)
    setError("")
    try {
      const res = await fetch(`/api/admin/listings/${id}/${action}`, {
        method: "POST",
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Failed to ${action} listing.`)
        return
      }
      setSelected(null)
      await loadListings()
    } catch {
      setError(`Failed to ${action} listing.`)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-border-brand pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Sauraha Nepal — Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-light">Manage business listing submissions</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer self-start rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-green-mid hover:text-green-brand"
        >
          Logout
        </button>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total listings", value: stats.total },
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

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === tab.id
                ? "bg-green-brand text-white"
                : "bg-white text-text-mid hover:bg-green-mid/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-light">
                    Loading listings…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-light">
                    No listings found.
                  </td>
                </tr>
              ) : (
                filtered.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-border-brand/60 hover:bg-cream/40"
                  >
                    <td className="px-4 py-3 font-semibold text-text-brand">
                      {listing.business_name}
                    </td>
                    <td className="px-4 py-3 text-text-mid">{listing.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${planBadgeClass(listing.plan)}`}
                      >
                        {planLabel(listing.plan)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-mid">{listing.owner_name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${listing.email}`}
                        className="text-green-mid hover:underline"
                      >
                        {listing.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-text-mid">{listing.phone ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-light">
                      {formatSubmittedDate(listing.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadgeClass(listing.status)}`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          title="Approve"
                          disabled={actionId === listing.id || listing.status === "approved"}
                          onClick={() => handleAction(listing.id, "approve")}
                          className="cursor-pointer rounded-lg bg-green-mid/15 px-2 py-1 text-sm hover:bg-green-mid/25 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          title="Reject"
                          disabled={actionId === listing.id || listing.status === "rejected"}
                          onClick={() => handleAction(listing.id, "reject")}
                          className="cursor-pointer rounded-lg bg-red-100 px-2 py-1 text-sm hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✗
                        </button>
                        <button
                          type="button"
                          title="View details"
                          onClick={() => setSelected(listing)}
                          className="cursor-pointer rounded-lg bg-cream px-2 py-1 text-sm hover:bg-green-mid/10"
                        >
                          👁
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-detail-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="listing-detail-title"
                className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand"
              >
                {selected.business_name}
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="cursor-pointer text-2xl leading-none text-text-light hover:text-text-brand"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <dl>
              <DetailRow label="Category" value={selected.category} />
              <DetailRow label="Plan" value={planLabel(selected.plan)} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Owner" value={selected.owner_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="WhatsApp" value={selected.whatsapp} />
              <DetailRow label="Description" value={selected.description} />
              <DetailRow label="Address" value={selected.address} />
              <DetailRow label="Price range" value={selected.price_range} />
              <DetailRow label="Opening hours" value={selected.opening_hours} />
              <DetailRow label="Website" value={selected.website} />
              <DetailRow label="Facebook" value={selected.facebook} />
              <DetailRow label="Google Maps" value={selected.google_maps_link} />
              <DetailRow label="Photo links" value={selected.photo_links} />
              <DetailRow
                label="Submitted"
                value={formatSubmittedDate(selected.created_at)}
              />
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {selected.status !== "approved" && (
                <button
                  type="button"
                  disabled={actionId === selected.id}
                  onClick={() => handleAction(selected.id, "approve")}
                  className="btn-primary cursor-pointer px-4 py-2 text-sm disabled:opacity-60"
                >
                  Approve
                </button>
              )}
              {selected.status !== "rejected" && (
                <button
                  type="button"
                  disabled={actionId === selected.id}
                  onClick={() => handleAction(selected.id, "reject")}
                  className="cursor-pointer rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
