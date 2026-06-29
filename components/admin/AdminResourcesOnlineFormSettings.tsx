"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

type Toast = { id: number; type: "success" | "error"; message: string }

const fieldClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

export default function AdminResourcesOnlineFormSettings() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const loadUrl = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/resources/online-form")
      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load online form link.")
        return
      }

      setUrl(data.url ?? "")
    } catch {
      setError("Failed to load online form link.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadUrl()
  }, [loadUrl])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/resources/online-form", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        const message = data.error ?? "Failed to save online form link."
        setError(message)
        showToast("error", message)
        return
      }

      setUrl(data.url ?? "")
      showToast("success", "Online form link saved.")
    } catch {
      const message = "Failed to save online form link."
      setError(message)
      showToast("error", message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSave}
        className="mb-6 rounded-2xl border border-border-brand bg-white p-5 md:p-6"
      >
        <h3 className="text-sm font-bold uppercase tracking-wide text-text-light">Online form</h3>
        <p className="mt-1 text-sm text-text-light">
          Google Form link shown as an Online Form button on the team Resources page. Leave blank to
          hide the button.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-orange-brand">
            {error}
          </p>
        )}

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold text-text-mid">Google Form URL</span>
          <input
            type="url"
            className={fieldClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/e/…/viewform"
            disabled={loading || saving}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || saving}
            className="btn-primary cursor-pointer px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save link"}
          </button>
          {url.trim() && (
            <a
              href={url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-green-brand hover:underline"
            >
              Preview form ↗
            </a>
          )}
        </div>
      </form>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
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
    </>
  )
}
