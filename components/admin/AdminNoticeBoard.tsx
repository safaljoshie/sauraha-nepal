"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { formatNoticeDate, type TeamNotice } from "@/lib/team-notices"

type NoticeFormState = {
  title: string
  message: string
  link: string
  is_pinned: boolean
  is_active: boolean
  expires_at: string
}

const emptyForm = (): NoticeFormState => ({
  title: "",
  message: "",
  link: "",
  is_pinned: false,
  is_active: true,
  expires_at: "",
})

const fieldClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

export default function AdminNoticeBoard() {
  const router = useRouter()
  const [notices, setNotices] = useState<TeamNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NoticeFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadNotices = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/notices")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { notices?: TeamNotice[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load notices.")
        return
      }
      setNotices(data.notices ?? [])
    } catch {
      setError("Failed to load notices.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(notice: TeamNotice) {
    setEditingId(notice.id)
    setForm({
      title: notice.title,
      message: notice.message,
      link: notice.link ?? "",
      is_pinned: notice.is_pinned,
      is_active: notice.is_active,
      expires_at: notice.expires_at ?? "",
    })
    setFormOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const payload = {
        title: form.title,
        message: form.message,
        link: form.link || null,
        is_pinned: form.is_pinned,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      }

      const res = await fetch(
        editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices",
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

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to save notice.")
        return
      }

      setFormOpen(false)
      await loadNotices()
    } catch {
      setError("Failed to save notice.")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string, field: "is_active" | "is_pinned", value: boolean) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) {
        setError("Failed to update notice.")
        return
      }
      await loadNotices()
    } catch {
      setError("Failed to update notice.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(notice: TeamNotice) {
    if (!window.confirm(`Delete notice "${notice.title}"?`)) return
    setBusyId(notice.id)
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, { method: "DELETE" })
      if (!res.ok) {
        setError("Failed to delete notice.")
        return
      }
      await loadNotices()
    } catch {
      setError("Failed to delete notice.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-green-brand/20 bg-cream/50 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
            Notice board
          </h3>
          <p className="mt-1 text-sm text-text-light">
            Pin announcements for your team at the top of the team calendar.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer self-start rounded-full border border-green-brand bg-white px-4 py-2 text-sm font-semibold text-green-brand hover:bg-green-brand hover:text-white"
        >
          + Add notice
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-text-light">Loading notices…</p>
      ) : notices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-brand bg-white px-4 py-6 text-center text-sm text-text-light">
          No notices yet. Add one to show it on the team calendar.
        </p>
      ) : (
        <ul className="space-y-3">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className={`rounded-xl border bg-white p-4 ${
                notice.is_active ? "border-border-brand" : "border-border-brand/50 opacity-70"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.is_pinned && (
                      <span className="rounded-full bg-orange-brand/15 px-2 py-0.5 text-xs font-bold text-orange-brand">
                        Pinned
                      </span>
                    )}
                    {!notice.is_active && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
                        Hidden
                      </span>
                    )}
                    <h4 className="font-semibold text-text-brand">{notice.title}</h4>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-text-mid">
                    {notice.message}
                  </p>
                  <p className="mt-2 text-xs text-text-light">
                    Posted {formatNoticeDate(notice.created_at)}
                    {notice.expires_at && ` · Expires ${formatNoticeDate(notice.expires_at)}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === notice.id}
                    onClick={() => handleToggle(notice.id, "is_pinned", !notice.is_pinned)}
                    className="cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid"
                  >
                    {notice.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === notice.id}
                    onClick={() => handleToggle(notice.id, "is_active", !notice.is_active)}
                    className="cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid"
                  >
                    {notice.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === notice.id}
                    onClick={() => openEdit(notice)}
                    className="cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busyId === notice.id}
                    onClick={() => handleDelete(notice)}
                    className="cursor-pointer rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
          role="presentation"
          onClick={() => !saving && setFormOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
              {editingId ? "Edit notice" : "New notice"}
            </h4>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Title</span>
                <input
                  type="text"
                  className={fieldClass}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">Message</span>
                <textarea
                  className={`${fieldClass} min-h-[120px] resize-y`}
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">
                  Link (optional)
                </span>
                <input
                  type="url"
                  className={fieldClass}
                  value={form.link}
                  onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="https://…"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-mid">
                  Expires on (optional)
                </span>
                <input
                  type="date"
                  className={fieldClass}
                  value={form.expires_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, expires_at: e.target.value }))}
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-text-mid">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))}
                />
                Pin to top of notice board
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-text-mid">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Visible to team
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
                {saving ? "Saving…" : "Save notice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
