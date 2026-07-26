"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/ToastProvider"

type Status = "idle" | "saving"

export default function ProfileForm({
  initialDisplayName,
  initialCountry,
  email,
}: {
  initialDisplayName: string
  initialCountry: string
  email: string
}) {
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [country, setCountry] = useState(initialCountry)
  const [status, setStatus] = useState<Status>("idle")
  const saving = status === "saving"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) {
      toast("Please enter a display name.", "error")
      return
    }
    setStatus("saving")
    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim(), country: country.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 429) {
        toast(data.error ?? "You're doing that too fast. Please try again shortly.", "error")
        return
      }
      if (!res.ok) {
        toast(data.error ?? "Could not save your changes.", "error")
        return
      }
      toast("Profile updated.", "success")
    } catch {
      toast("Could not save your changes. Please try again.", "error")
    } finally {
      setStatus("idle")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-green-mid/30 bg-green-mid/5 px-4 py-3 text-sm text-text-mid">
        This account is connected to your Google account. Your email and picture are managed there.
      </div>

      <Field label="Display name" hint="Shown with the reviews you write.">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          required
          disabled={saving}
          className="w-full rounded-xl border border-border-brand bg-white px-4 py-3 text-ink outline-none focus:border-green-mid disabled:opacity-60"
        />
      </Field>

      <Field label="Country" hint="Optional — shown with your reviews.">
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          maxLength={60}
          disabled={saving}
          placeholder="e.g. Australia"
          className="w-full rounded-xl border border-border-brand bg-white px-4 py-3 text-ink outline-none focus:border-green-mid disabled:opacity-60"
        />
      </Field>

      <Field label="Email">
        <div className="flex items-center justify-between rounded-xl border border-border-brand bg-cream px-4 py-3 text-text-mid">
          <span className="truncate">{email}</span>
          <span aria-hidden className="ml-2 shrink-0 text-sm">🔒</span>
        </div>
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-green-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-mid disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-text-mid">{hint}</span>}
    </label>
  )
}
