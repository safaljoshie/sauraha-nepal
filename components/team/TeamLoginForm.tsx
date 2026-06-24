"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-border-brand bg-cream px-4 py-3 text-sm text-text-brand outline-none transition-colors focus:border-green-mid focus:bg-white disabled:opacity-60"

export default function TeamLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/team/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        setError(data.error ?? "Incorrect password")
        return
      }

      router.push("/team/calendar")
      router.refresh()
    } catch {
      setError("Incorrect password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="mb-1.5 block text-sm font-semibold text-text-mid">
        Team password
      </label>
      <input
        type="password"
        className={inputClass}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter team password"
        required
        disabled={loading}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn-primary mt-6 w-full cursor-pointer py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Signing in…" : "View calendar"}
      </button>
    </form>
  )
}
