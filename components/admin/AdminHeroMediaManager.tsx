"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import type { HeroMedia } from "@/lib/site-content"
import { getSupabasePublic } from "@/lib/supabase"

type Toast = { id: string; type: "success" | "error"; message: string }
type HeroForm = {
  id?: string
  type: "image" | "video"
  url: string
  poster_url: string
  alt_text: string
  is_active: boolean
  priority: number
}

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

const emptyForm: HeroForm = {
  type: "video",
  url: "",
  poster_url: "",
  alt_text: "",
  is_active: true,
  priority: 0,
}

export default function AdminHeroMediaManager() {
  const router = useRouter()
  const [media, setMedia] = useState<HeroMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [form, setForm] = useState<HeroForm | null>(null)

  const effectiveMedia = useMemo(
    () =>
      media
        .filter((item) => item.is_active && item.type === "video")
        .sort((a, b) => a.priority - b.priority || a.created_at.localeCompare(b.created_at))[0] ?? null,
    [media],
  )

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const loadMedia = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/site/hero")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { media?: HeroMedia[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load hero media.")
        return
      }
      setMedia(data.media ?? [])
    } catch {
      setError("Failed to load hero media.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  function openCreate() {
    setForm({ ...emptyForm, type: "video" })
    setError("")
  }

  function openEdit(item: HeroMedia) {
    setForm({
      id: item.id,
      type: item.type,
      url: item.url,
      poster_url: item.poster_url ?? "",
      alt_text: item.alt_text ?? "",
      is_active: item.is_active,
      priority: item.priority,
    })
    setError("")
  }

  function validateForm(state: HeroForm) {
    if (!state.url.trim()) return "Media URL is required."
    if (!/^https?:\/\//i.test(state.url.trim())) return "Media URL must be a valid HTTP/HTTPS URL."
    if (state.priority < 0) return "Priority must be 0 or greater."
    if (state.type === "video" && state.poster_url.trim() && !/^https?:\/\//i.test(state.poster_url.trim())) {
      return "Poster URL must be a valid HTTP/HTTPS URL."
    }
    return ""
  }

  async function handleSave() {
    if (!form) return
    const validation = validateForm(form)
    if (validation) {
      setError(validation)
      return
    }

    setSaving(true)
    setError("")
    try {
      const payload = {
        ...form,
        type: "video" as const,
        url: form.url.trim(),
        poster_url: form.poster_url.trim(),
        alt_text: form.alt_text.trim(),
      }
      const res = await fetch("/api/admin/site/hero", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { media?: HeroMedia; error?: string }
      if (!res.ok || !data.media) {
        setError(data.error ?? "Failed to save hero media.")
        showToast("error", "Failed to save hero media.")
        return
      }

      if (form.id) {
        setMedia((prev) =>
          prev
            .map((item) => (item.id === data.media!.id ? data.media! : item))
            .sort((a, b) => a.priority - b.priority || a.created_at.localeCompare(b.created_at)),
        )
      } else {
        setMedia((prev) =>
          [...prev, data.media!].sort(
            (a, b) => a.priority - b.priority || a.created_at.localeCompare(b.created_at),
          ),
        )
      }
      setForm(null)
      showToast("success", "Hero media saved.")
    } catch {
      setError("Failed to save hero media.")
      showToast("error", "Failed to save hero media.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: HeroMedia) {
    const confirmed = window.confirm(`Delete this ${item.type} media?\nThis cannot be undone.`)
    if (!confirmed) return

    const previous = media
    setMedia((prev) => prev.filter((m) => m.id !== item.id))

    try {
      const res = await fetch("/api/admin/site/hero", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setMedia(previous)
        setError(data.error ?? "Failed to delete hero media.")
        showToast("error", "Failed to delete hero media.")
        return
      }
      showToast("success", "Hero media deleted.")
    } catch {
      setMedia(previous)
      setError("Failed to delete hero media.")
      showToast("error", "Failed to delete hero media.")
    }
  }

  async function uploadHeroFileDirect(
    file: File,
    type: "image" | "video",
  ): Promise<{ url: string } | { error: string }> {
    const initRes = await fetch("/api/admin/site/hero/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      }),
    })
    if (initRes.status === 401) {
      router.push("/admin")
      return { error: "Unauthorized." }
    }
    const initData = (await initRes.json()) as {
      bucket?: string
      token?: string
      path?: string
      contentType?: string
      url?: string
      error?: string
    }
    if (!initRes.ok || !initData.token || !initData.path || !initData.bucket || !initData.url) {
      return { error: initData.error ?? "Failed to prepare upload." }
    }

    const supabase = getSupabasePublic()
    const { error: uploadError } = await supabase.storage
      .from(initData.bucket)
      .uploadToSignedUrl(initData.path, initData.token, file, {
        contentType: initData.contentType ?? file.type ?? "video/mp4",
        upsert: false,
      })

    if (uploadError) {
      const msg = uploadError.message?.trim() || "Upload to storage failed."
      const hint =
        msg.toLowerCase().includes("size") || msg.toLowerCase().includes("limit")
          ? " In Supabase → Storage → your bucket, set max file size to at least 50 MB and allow video/mp4."
          : ""
      return { error: `${msg}${hint}` }
    }

    return { url: initData.url }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>, type: "image" | "video") {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !form) return

    setUploading(true)
    setError("")
    try {
      let publicUrl: string | undefined
      let uploadError: string | undefined

      const result = await uploadHeroFileDirect(file, "video")
      if ("error" in result) uploadError = result.error
      else publicUrl = result.url

      if (!publicUrl) {
        setError(uploadError ?? "Failed to upload media.")
        showToast("error", uploadError ?? "Failed to upload media.")
        return
      }

      setForm((prev) => (prev ? { ...prev, type, url: publicUrl! } : prev))
      showToast("success", "Upload complete. Click Save Media to publish.")
    } catch {
      setError("Failed to upload media.")
      showToast("error", "Failed to upload media.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border-brand pb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-orange-brand uppercase">Admin</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-3xl">
            Homepage Hero Video
          </h1>
          <p className="mt-1 text-sm text-text-light">
            Only video is shown on the homepage. Delete old image rows if you no longer need them.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid"
          >
            Add Video
          </button>
        </div>
      </header>

      {effectiveMedia && (
        <p className="mb-4 rounded-[10px] border border-green-mid/30 bg-green-mid/10 px-4 py-3 text-sm text-green-brand">
          Live homepage video (priority {effectiveMedia.priority})
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Alt / Poster</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-light">
                    Loading hero media…
                  </td>
                </tr>
              ) : media.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-light">
                    No hero media yet.
                  </td>
                </tr>
              ) : (
                media.map((item) => (
                  <tr key={item.id} className="border-b border-border-brand/60 hover:bg-cream/40">
                    <td className="px-4 py-3">
                      {item.type === "image" ? (
                        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-border-brand">
                          <Image src={item.url} alt={item.alt_text ?? "Hero image"} fill className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-xs text-text-light">{item.url}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-brand">
                      {item.type}
                      {item.type === "image" && (
                        <span className="ml-2 rounded-full bg-orange-brand/15 px-2 py-0.5 text-xs font-bold text-orange-brand">
                          Not on site
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-mid">{item.priority}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.is_active ? "bg-green-mid/15 text-green-brand" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-mid">
                      <p>{item.alt_text ?? "-"}</p>
                      {item.poster_url && <p className="text-xs text-text-light">{item.poster_url}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg bg-red-100 px-2.5 py-1 text-sm text-red-700 hover:bg-red-200"
                        >
                          Delete
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

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-brand bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
                {form.id ? "Edit Hero Video" : "Add Hero Video"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="text-2xl leading-none text-text-light hover:text-text-brand"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Priority" required className="md:col-span-2">
                <input
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, priority: Number.parseInt(e.target.value || "0", 10) } : prev,
                    )
                  }
                  className={fieldClass}
                />
              </Field>

              <Field label="Upload video" className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200">
                    {uploading ? "Uploading..." : "Upload Video"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,.mp4,.webm"
                      onChange={(e) => handleUpload(e, "video")}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <span className="text-xs text-text-light">MP4 or WEBM, up to 50 MB.</span>
                </div>
              </Field>

              <Field label="Media URL" required className="md:col-span-2">
                <input
                  value={form.url}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, url: e.target.value } : prev))}
                  className={fieldClass}
                />
              </Field>

              <Field label="Poster URL (video only)" className="md:col-span-2">
                <input
                  value={form.poster_url}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, poster_url: e.target.value } : prev))}
                  className={fieldClass}
                />
              </Field>

              <Field label="Active" className="md:col-span-2">
                <label className="flex h-[42px] items-center gap-2 text-sm text-text-mid">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, is_active: e.target.checked } : prev))}
                  />
                  Visible on homepage
                </label>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-full border border-border-brand px-4 py-2 text-sm font-semibold text-text-mid hover:bg-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-green-brand px-5 py-2 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Media"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success" ? "bg-green-brand text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  required,
  className = "",
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <label className={`block text-sm text-text-mid ${className}`}>
      <span className="mb-1 block font-semibold text-text-brand">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  )
}
