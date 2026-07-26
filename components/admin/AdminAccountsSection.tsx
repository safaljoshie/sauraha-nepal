"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { AdminAccount } from "@/app/api/admin/accounts/route"

type StatusFilter = "all" | "active" | "deactivated"

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "deactivated", label: "Deactivated" },
]

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AdminAccountsSection() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const res = await fetch("/api/admin/accounts")
      if (!res.ok) {
        setError("Failed to load accounts.")
        return
      }
      const data = (await res.json()) as { accounts?: AdminAccount[] }
      setAccounts(data.accounts ?? [])
    } catch {
      setError("Failed to load accounts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const activeCount = useMemo(() => accounts.filter((a) => !a.deleted_at).length, [accounts])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return accounts.filter((account) => {
      if (filter === "active" && account.deleted_at) return false
      if (filter === "deactivated" && !account.deleted_at) return false
      if (!term) return true
      return (
        (account.email ?? "").toLowerCase().includes(term) ||
        (account.display_name ?? "").toLowerCase().includes(term) ||
        (account.country ?? "").toLowerCase().includes(term)
      )
    })
  }, [accounts, filter, search])

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
          Logged in accounts
        </h3>
        <p className="text-sm text-text-light">
          {activeCount} active · {accounts.length} total
        </p>
      </div>
      <p className="mt-1 text-sm text-text-light">
        People who signed in with Google. Read-only — profiles are managed by the account holder.
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === tab.id ? "bg-green-brand text-white" : "bg-white text-text-mid hover:bg-cream"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search email, name, country…"
          className="ml-auto w-full max-w-xs rounded-full border border-border-brand bg-white px-4 py-2 text-sm text-text-mid outline-none focus:border-green-brand md:w-auto"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold tracking-wide text-text-light uppercase">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-light">
                    Loading accounts…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-light">
                    No accounts in this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((account) => (
                  <tr key={account.id} className="border-b border-border-brand last:border-0">
                    <td className="px-4 py-3 font-medium text-text-dark">{account.email ?? "—"}</td>
                    <td className="px-4 py-3 text-text-mid">{account.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-text-mid">{account.country ?? "—"}</td>
                    <td className="px-4 py-3 text-text-mid">{formatDate(account.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          account.deleted_at
                            ? "bg-red-100 text-red-700"
                            : "bg-green-mid/15 text-green-brand"
                        }`}
                      >
                        {account.deleted_at ? "Deactivated" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
