"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

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
      <label className="team-body-text mb-1.5 block font-semibold text-text-mid">
        Team password
      </label>
      <input
        type="password"
        className="team-input rounded-[10px] border-[1.5px] bg-cream focus:bg-white disabled:opacity-60"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter team password"
        required
        disabled={loading}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="team-body-text mt-3 text-center font-semibold text-orange-brand">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn-primary team-action-btn mt-5 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
