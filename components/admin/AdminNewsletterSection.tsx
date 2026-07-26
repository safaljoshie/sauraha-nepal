"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import {
  RESEND_FREE_TIER_WARNING_THRESHOLD,
  type NewsletterCampaign,
  type NewsletterSubscriber,
} from "@/lib/newsletter"

type SubTab = "subscribers" | "campaigns"
type SubscriberFilter = "all" | "active" | "unsubscribed" | "pending"

const PROCESS_INTERVAL_MS = 5 * 60 * 1000

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

type SubscriberBadge = {
  label: string
  className: string
}

function subscriberBadge(sub: NewsletterSubscriber): SubscriberBadge {
  if (sub.status === "unsubscribed") {
    return { label: "Unsubscribed", className: "bg-gray-100 text-gray-600" }
  }
  if (sub.status === "bounced") {
    return { label: "Bounced", className: "bg-red-100 text-red-700" }
  }
  if (!sub.confirmed) {
    return { label: "Pending confirmation", className: "bg-yellow-100 text-yellow-800" }
  }
  return { label: "Active", className: "bg-green-100 text-green-700" }
}

const CAMPAIGN_BADGES: Record<NewsletterCampaign["status"], string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-orange-100 text-orange-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
}

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

export default function AdminNewsletterSection({ view }: { view?: SubTab } = {}) {
  const router = useRouter()
  const [subTab, setSubTab] = useState<SubTab>(view ?? "subscribers")

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filter, setFilter] = useState<SubscriberFilter>("all")
  const [search, setSearch] = useState("")

  const [showAddForm, setShowAddForm] = useState(false)
  const [addEmail, setAddEmail] = useState("")
  const [addName, setAddName] = useState("")
  const [addSkipConfirm, setAddSkipConfirm] = useState(true)
  const [addBusy, setAddBusy] = useState(false)

  const [importResult, setImportResult] = useState("")
  const [importBusy, setImportBusy] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleUnauthorized = useCallback(() => {
    router.push("/admin")
  }, [router])

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/subscribers")
      if (res.status === 401) return handleUnauthorized()
      const data = (await res.json()) as { subscribers?: NewsletterSubscriber[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load subscribers.")
        return
      }
      setSubscribers(data.subscribers ?? [])
    } catch {
      setError("Failed to load subscribers.")
    }
  }, [handleUnauthorized])

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/campaigns")
      if (res.status === 401) return handleUnauthorized()
      const data = (await res.json()) as { campaigns?: NewsletterCampaign[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load campaigns.")
        return
      }
      setCampaigns(data.campaigns ?? [])
    } catch {
      setError("Failed to load campaigns.")
    }
  }, [handleUnauthorized])

  // Load data, and process any due scheduled campaigns on mount + on interval.
  useEffect(() => {
    let active = true

    async function processScheduled() {
      try {
        await fetch("/api/admin/newsletter/process-scheduled", { method: "POST" })
      } catch {
        // Silent — best-effort background trigger.
      }
    }

    async function init() {
      setLoading(true)
      await processScheduled()
      if (!active) return
      await Promise.all([loadSubscribers(), loadCampaigns()])
      if (active) setLoading(false)
    }

    init()
    const interval = setInterval(() => {
      processScheduled().then(() => {
        if (active) loadCampaigns()
      })
    }, PROCESS_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [loadSubscribers, loadCampaigns])

  const stats = useMemo(() => {
    let activeCount = 0
    let unsubscribed = 0
    let pending = 0
    for (const sub of subscribers) {
      if (sub.status === "unsubscribed") unsubscribed += 1
      else if (sub.status === "active" && !sub.confirmed) pending += 1
      else if (sub.status === "active" && sub.confirmed) activeCount += 1
    }
    return { total: subscribers.length, active: activeCount, unsubscribed, pending }
  }, [subscribers])

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return subscribers.filter((sub) => {
      if (filter === "active" && !(sub.status === "active" && sub.confirmed)) return false
      if (filter === "unsubscribed" && sub.status !== "unsubscribed") return false
      if (filter === "pending" && !(sub.status === "active" && !sub.confirmed)) return false
      if (term) {
        const haystack = `${sub.email} ${sub.name ?? ""}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [subscribers, filter, search])

  async function addSubscriber() {
    const email = addEmail.trim().toLowerCase()
    if (!email) {
      setError("Email is required.")
      return
    }
    setAddBusy(true)
    setError("")
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: addName.trim() || undefined,
          skipConfirmation: addSkipConfirm,
        }),
      })
      if (res.status === 401) return handleUnauthorized()
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to add subscriber.")
        return
      }
      setAddEmail("")
      setAddName("")
      setShowAddForm(false)
      await loadSubscribers()
    } catch {
      setError("Failed to add subscriber.")
    } finally {
      setAddBusy(false)
    }
  }

  async function deleteSubscriber(id: string) {
    if (!window.confirm("Delete this subscriber? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, { method: "DELETE" })
      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Failed to delete subscriber.")
        return
      }
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError("Failed to delete subscriber.")
    }
  }

  async function exportCsv() {
    try {
      const res = await fetch("/api/admin/newsletter/subscribers/export")
      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) {
        setError("Failed to export subscribers.")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError("Failed to export subscribers.")
    }
  }

  async function importCsv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setImportBusy(true)
    setImportResult("")
    setError("")
    try {
      const formData = new FormData()
      formData.set("file", file)
      const res = await fetch("/api/admin/newsletter/subscribers/import", {
        method: "POST",
        body: formData,
      })
      if (res.status === 401) return handleUnauthorized()
      const data = (await res.json()) as { imported?: number; skipped?: number; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to import subscribers.")
        return
      }
      setImportResult(`Imported ${data.imported ?? 0} subscribers, skipped ${data.skipped ?? 0} duplicates.`)
      await loadSubscribers()
    } catch {
      setError("Failed to import subscribers.")
    } finally {
      setImportBusy(false)
    }
  }

  async function duplicateCampaign(id: string) {
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}/duplicate`, { method: "POST" })
      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) {
        setError("Failed to duplicate campaign.")
        return
      }
      await loadCampaigns()
    } catch {
      setError("Failed to duplicate campaign.")
    }
  }

  async function deleteCampaign(id: string) {
    if (!window.confirm("Delete this draft campaign? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { method: "DELETE" })
      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Failed to delete campaign.")
        return
      }
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError("Failed to delete campaign.")
    }
  }

  const nearFreeTierLimit = stats.active > RESEND_FREE_TIER_WARNING_THRESHOLD

  return (
    <div className="min-w-0 w-full max-w-full">
      {!(view && subTab === "subscribers") && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {!view &&
            (["subscribers", "campaigns"] as SubTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  subTab === tab ? "bg-green-brand text-white" : "bg-white text-text-mid hover:bg-cream"
                }`}
              >
                {tab === "subscribers" ? "Subscribers" : "Campaigns"}
              </button>
            ))}
          <Link
            href="/admin/newsletter/compose"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
          >
            <SiteIcon name="pen-line" size={16} className="text-white" />
            New Campaign
          </Link>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {nearFreeTierLimit && (
        <p className="mb-4 rounded-[10px] border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
          You are approaching Resend&apos;s free tier limit (100 emails/day). Consider upgrading your
          Resend plan before sending to all {stats.active} active subscribers.
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-text-light">Loading…</p>
      ) : subTab === "subscribers" ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total subscribers", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Unsubscribed", value: stats.unsubscribed },
              { label: "Pending confirmation", value: stats.pending },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border-brand bg-white p-4">
                <p className="text-2xl font-bold text-green-brand">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-text-light">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(["all", "active", "unsubscribed", "pending"] as SubscriberFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  filter === f ? "bg-green-brand text-white" : "bg-white text-text-mid hover:bg-cream"
                }`}
              >
                {f}
              </button>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="cursor-pointer rounded-full border border-green-brand bg-white px-4 py-1.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white"
              >
                Add Subscriber
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-1.5 text-sm font-semibold text-text-mid transition-colors hover:bg-cream"
              >
                Export CSV
              </button>
              <label className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-1.5 text-sm font-semibold text-text-mid transition-colors hover:bg-cream">
                {importBusy ? "Importing…" : "Import CSV"}
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={importCsv}
                  className="hidden"
                  disabled={importBusy}
                />
              </label>
            </div>
          </div>

          {importResult && (
            <p className="mb-4 rounded-[10px] border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              {importResult}
            </p>
          )}

          {showAddForm && (
            <div className="mb-6 rounded-2xl border border-border-brand bg-cream p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-mid">Email *</label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className={fieldClass}
                    placeholder="subscriber@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-mid">Name (optional)</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-text-mid">
                <input
                  type="checkbox"
                  checked={addSkipConfirm}
                  onChange={(e) => setAddSkipConfirm(e.target.checked)}
                />
                Skip confirmation email (mark as confirmed)
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={addBusy}
                  onClick={addSubscriber}
                  className="cursor-pointer rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
                >
                  {addBusy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer rounded-full border border-border-brand bg-white px-5 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name…"
              className={fieldClass}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border-brand bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border-brand bg-cream text-xs uppercase text-text-light">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Subscribed</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-light">
                      No subscribers match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => {
                    const badge = subscriberBadge(sub)
                    return (
                      <tr key={sub.id} className="border-b border-border-brand/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-text-brand">{sub.email}</td>
                        <td className="px-4 py-3 text-text-mid">{sub.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-mid capitalize">{sub.source}</td>
                        <td className="px-4 py-3 text-text-mid">{formatDate(sub.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteSubscriber(sub.id)}
                            className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${sub.email}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-brand bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border-brand bg-cream text-xs uppercase text-text-light">
              <tr>
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-light">
                    No campaigns yet. Create your first one with “New Campaign”.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const editable = c.status === "draft" || c.status === "scheduled"
                  const dateLabel =
                    c.status === "sent"
                      ? formatDate(c.sent_at)
                      : c.status === "scheduled"
                        ? formatDate(c.scheduled_at)
                        : formatDate(c.created_at)
                  return (
                    <tr key={c.id} className="border-b border-border-brand/60 last:border-0">
                      <td className="px-4 py-3 font-medium text-text-brand">{c.title}</td>
                      <td className="px-4 py-3 text-text-mid">{c.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${CAMPAIGN_BADGES[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-mid">{dateLabel}</td>
                      <td className="px-4 py-3 text-text-mid">
                        {c.status === "sent" ? c.sent_count : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Link
                            href={`/admin/newsletter/compose/${c.id}`}
                            className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-green-brand hover:bg-cream"
                          >
                            {editable ? "Edit" : "View"}
                          </Link>
                          <button
                            type="button"
                            onClick={() => duplicateCampaign(c.id)}
                            className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-text-mid hover:bg-cream"
                          >
                            Duplicate
                          </button>
                          {c.status === "draft" && (
                            <button
                              type="button"
                              onClick={() => deleteCampaign(c.id)}
                              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
