"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { SITE_SETTING_KEYS, type SiteSettingsMap } from "@/lib/site-settings-keys"

type Toast = { id: string; type: "success" | "error"; message: string }

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

const LABELS: Record<(typeof SITE_SETTING_KEYS)[number], string> = {
  facebook_url: "Facebook URL",
  instagram_url: "Instagram URL",
  twitter_url: "Twitter/X URL",
  tiktok_url: "TikTok URL",
  youtube_url: "YouTube URL",
  whatsapp_number: "WhatsApp Number",
  email: "Contact Email",
}

const EMPTY_SETTINGS: SiteSettingsMap = {
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  tiktok_url: "",
  youtube_url: "",
  whatsapp_number: "",
  email: "",
}

export default function AdminSiteSettingsSection() {
  const router = useRouter()
  const [form, setForm] = useState<SiteSettingsMap>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/settings", { credentials: "same-origin" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { settings?: SiteSettingsMap; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load settings.")
        return
      }
      setForm(data.settings ?? EMPTY_SETTINGS)
    } catch {
      setError("Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { settings?: SiteSettingsMap; error?: string }
      if (!res.ok) {
        const msg = data.error ?? "Failed to save settings."
        setError(msg)
        showToast("error", msg)
        return
      }
      if (data.settings) setForm(data.settings)
      showToast("success", "Settings saved!")
      await loadSettings()
    } catch {
      showToast("error", "Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-text-light">Loading settings…</p>
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
          Site Settings
        </h2>
        <p className="mt-1 text-sm text-text-light">
          Social links appear in the footer when URLs are filled in.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSave}
        noValidate
        className="max-w-xl space-y-4 rounded-2xl border border-border-brand bg-white p-6 shadow-sm"
      >
        {SITE_SETTING_KEYS.map((key) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">
              {LABELS[key]}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className={fieldClass}
              placeholder={
                key === "whatsapp_number" ? "9779841234567" : key === "email" ? "hello@example.com" : ""
              }
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-full bg-green-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>

      <div className="pointer-events-none fixed right-4 bottom-4 z-[200] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.type === "success" ? "bg-green-brand" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  )
}
