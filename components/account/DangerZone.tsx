"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { useToast } from "@/components/ui/ToastProvider"

export default function DangerZone() {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (res.status === 429) {
        toast(data.error ?? "You're doing that too fast. Please try again shortly.", "error")
        setDeleting(false)
        return
      }
      if (!res.ok) {
        toast(data.error ?? "Could not delete your account. Please try again.", "error")
        setDeleting(false)
        return
      }
      // Deactivated — sign out locally and leave.
      await supabase.auth.signOut()
      router.push("/signin?error=deactivated")
      router.refresh()
    } catch {
      toast("Could not delete your account. Please try again.", "error")
      setDeleting(false)
    }
  }

  return (
    <section className="mt-12 rounded-xl border border-orange-brand/30 p-5">
      <h2 className="text-lg font-bold text-orange-brand">Danger zone</h2>
      <p className="mt-1 text-sm text-text-mid">
        Deleting your account deactivates it and removes your reviews from public view. This can’t be
        undone from here — contact us if you’d like it restored.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-xl border border-orange-brand/40 px-5 py-2.5 text-sm font-bold text-orange-brand transition-colors hover:bg-orange-brand/5"
        >
          Delete account
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-ink">Are you sure?</span>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting}
            className="rounded-xl bg-orange-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Yes, delete my account"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-mid hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}
