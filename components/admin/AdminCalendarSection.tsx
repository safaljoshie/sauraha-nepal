"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import AdminNoticeBoard from "@/components/admin/AdminNoticeBoard"
import CalendarFilters from "@/components/calendar/CalendarFilters"
import CalendarGridView from "@/components/calendar/CalendarGridView"
import CalendarListView from "@/components/calendar/CalendarListView"
import CalendarMobileToolbar from "@/components/calendar/CalendarMobileToolbar"
import CalendarSummary from "@/components/calendar/CalendarSummary"
import {
  CALENDAR_PLATFORMS,
  CALENDAR_STATUSES,
  countActiveCalendarFilters,
  currentMonthKey,
  cycleStatus,
  filterCalendarEntries,
  shiftScheduledDate,
  statusLabel,
  type ContentCalendarEntry,
  type DuplicateInterval,
} from "@/lib/content-calendar"
import { useIsMobile } from "@/lib/use-media-query"

type ViewMode = "list" | "calendar"

type FormState = {
  scheduled_date: string
  content_title: string
  platform: string
  status: string
  owner: string
  notes: string
  link: string
}

const emptyForm = (): FormState => ({
  scheduled_date: new Date().toISOString().slice(0, 10),
  content_title: "",
  platform: "Instagram",
  status: "draft",
  owner: "",
  notes: "",
  link: "",
})

const fieldClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

export default function AdminCalendarSection() {
  const router = useRouter()
  const [entries, setEntries] = useState<ContentCalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [month, setMonth] = useState(currentMonthKey())
  const [platform, setPlatform] = useState("All")
  const [status, setStatus] = useState("All")
  const [owner, setOwner] = useState("All")
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionBusyId, setActionBusyId] = useState<string | null>(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const isMobile = useIsMobile()
  const activeFilterCount = countActiveCalendarFilters({ platform, status, owner })

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (month) params.set("month", month)

      const res = await fetch(`/api/admin/calendar?${params.toString()}`)
      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { entries?: ContentCalendarEntry[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load calendar entries.")
        return
      }

      setEntries(data.entries ?? [])
    } catch {
      setError("Failed to load calendar entries.")
    } finally {
      setLoading(false)
    }
  }, [month, router])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const monthEntries = useMemo(
    () => filterCalendarEntries(entries, { month }),
    [entries, month],
  )

  const filteredEntries = useMemo(
    () =>
      filterCalendarEntries(entries, {
        month,
        platform,
        status,
        owner,
        search,
      }),
    [entries, month, owner, platform, search, status],
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entry: ContentCalendarEntry) {
    setEditingId(entry.id)
    setForm({
      scheduled_date: entry.scheduled_date,
      content_title: entry.content_title,
      platform: entry.platform,
      status: entry.status,
      owner: entry.owner,
      notes: entry.notes ?? "",
      link: entry.link ?? "",
    })
    setFormOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError("")

    try {
      const payload = {
        scheduled_date: form.scheduled_date,
        content_title: form.content_title,
        platform: form.platform,
        status: form.status,
        owner: form.owner,
        notes: form.notes || null,
        link: form.link || null,
      }

      const res = await fetch(
        editingId ? `/api/admin/calendar/${editingId}` : "/api/admin/calendar",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { entry?: ContentCalendarEntry; error?: string }
      if (!res.ok || !data.entry) {
        setError(data.error ?? "Failed to save entry.")
        return
      }

      setFormOpen(false)
      await loadEntries()
    } catch {
      setError("Failed to save entry.")
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusCycle(entry: ContentCalendarEntry) {
    const nextStatus = cycleStatus(entry.status)
    setActionBusyId(entry.id)

    try {
      const res = await fetch(`/api/admin/calendar/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { entry?: ContentCalendarEntry; error?: string }
      if (!res.ok || !data.entry) {
        setError(data.error ?? "Failed to update status.")
        return
      }

      setEntries((prev) => prev.map((item) => (item.id === entry.id ? data.entry! : item)))
    } catch {
      setError("Failed to update status.")
    } finally {
      setActionBusyId(null)
    }
  }

  async function handleDelete(entry: ContentCalendarEntry) {
    if (!window.confirm(`Delete "${entry.content_title}"? This cannot be undone.`)) return

    setActionBusyId(entry.id)
    try {
      const res = await fetch(`/api/admin/calendar/${entry.id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? "Failed to delete entry.")
        return
      }
      await loadEntries()
    } catch {
      setError("Failed to delete entry.")
    } finally {
      setActionBusyId(null)
    }
  }

  async function handleDuplicate(entry: ContentCalendarEntry, interval: DuplicateInterval) {
    setActionBusyId(entry.id)
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduled_date: shiftScheduledDate(entry.scheduled_date, interval),
          content_title: entry.content_title,
          platform: entry.platform,
          status: "draft",
          owner: entry.owner,
          notes: entry.notes,
          link: entry.link,
        }),
      })

      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to duplicate entry.")
        return
      }

      await loadEntries()
    } catch {
      setError("Failed to duplicate entry.")
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
            Content Calendar
          </h2>
          <p className="mt-1 text-sm text-text-light">
            Plan and manage social posts, blog content, and campaigns.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary cursor-pointer self-start px-5 py-2.5 text-sm"
        >
          + New Entry
        </button>
      </div>

      <AdminNoticeBoard />

      <CalendarSummary entries={monthEntries} />

      <div className="mt-6 hidden flex-wrap gap-2 md:flex">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${
            viewMode === "list" ? "bg-green-brand text-white" : "bg-white text-text-mid"
          }`}
        >
          📋 List View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("calendar")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${
            viewMode === "calendar" ? "bg-green-brand text-white" : "bg-white text-text-mid"
          }`}
        >
          📅 Calendar View
        </button>
      </div>

      <div className="mt-6">
        <CalendarMobileToolbar
          month={month}
          search={search}
          filtersExpanded={filtersExpanded}
          activeFilterCount={activeFilterCount}
          onMonthChange={setMonth}
          onSearchChange={setSearch}
          onFiltersExpandedChange={setFiltersExpanded}
          showThisMonth
          currentMonthKey={currentMonthKey()}
          onThisMonth={() => setMonth(currentMonthKey())}
        />
        <CalendarFilters
          month={month}
          platform={platform}
          status={status}
          owner={owner}
          search={search}
          allEntries={entries}
          onMonthChange={setMonth}
          onPlatformChange={setPlatform}
          onStatusChange={setStatus}
          onOwnerChange={setOwner}
          onSearchChange={setSearch}
          mobileFiltersExpanded={filtersExpanded}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
            Loading calendar…
          </div>
        ) : viewMode === "list" || isMobile ? (
          <CalendarListView
            entries={filteredEntries}
            onStatusClick={handleStatusCycle}
            onEdit={openEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            actionBusyId={actionBusyId}
          />
        ) : (
          <CalendarGridView
            entries={filteredEntries}
            month={month}
            onMonthChange={setMonth}
          />
        )}
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
          role="presentation"
          onClick={() => !saving && setFormOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
              {editingId ? "Edit entry" : "New calendar entry"}
            </h3>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">
                  Scheduled date
                </span>
                <input
                  type="date"
                  className={fieldClass}
                  value={form.scheduled_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">
                  Content title
                </span>
                <input
                  type="text"
                  className={fieldClass}
                  value={form.content_title}
                  onChange={(e) => setForm((prev) => ({ ...prev, content_title: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Platform</span>
                <select
                  className={fieldClass}
                  value={form.platform}
                  onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
                >
                  {CALENDAR_PLATFORMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Status</span>
                <select
                  className={fieldClass}
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {CALENDAR_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {statusLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Alloted</span>
                <input
                  type="text"
                  className={fieldClass}
                  value={form.owner}
                  onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                  placeholder="e.g. Marketing Manager"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Notes</span>
                <textarea
                  className={`${fieldClass} min-h-[90px] resize-y`}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Link</span>
                <input
                  type="url"
                  className={fieldClass}
                  value={form.link}
                  onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="cursor-pointer rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-text-mid"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary cursor-pointer px-5 py-2 text-sm disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
