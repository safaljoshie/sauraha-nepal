"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import CalendarFilters from "@/components/calendar/CalendarFilters"
import CalendarGridView from "@/components/calendar/CalendarGridView"
import CalendarListView from "@/components/calendar/CalendarListView"
import CalendarSummary from "@/components/calendar/CalendarSummary"
import TeamNextMonthNotice, {
  TEAM_NEXT_MONTH_NOTICE_KEY,
} from "@/components/team/TeamNextMonthNotice"
import {
  currentMonthKey,
  filterCalendarEntries,
  formatMonthLabel,
  nextMonthKey,
  parseMonthKey,
  shiftMonthKey,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

type ViewMode = "list" | "calendar"
const VIEW_STORAGE_KEY = "team-calendar-view"

async function fetchMonthEntries(month: string) {
  const params = new URLSearchParams({ month })
  const res = await fetch(`/api/team/calendar?${params.toString()}`)
  const data = (await res.json()) as { entries?: ContentCalendarEntry[]; error?: string }
  return { res, data }
}

export default function TeamCalendarApp() {
  const router = useRouter()
  const [entries, setEntries] = useState<ContentCalendarEntry[]>([])
  const [nextMonthEntries, setNextMonthEntries] = useState<ContentCalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [month, setMonth] = useState(currentMonthKey())
  const [platform, setPlatform] = useState("All")
  const [status, setStatus] = useState("All")
  const [owner, setOwner] = useState("All")
  const [search, setSearch] = useState("")
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  const viewingNextMonth = month === nextMonthKey()
  const previewMonth = nextMonthKey(month)

  useEffect(() => {
    const saved = sessionStorage.getItem(VIEW_STORAGE_KEY)
    if (saved === "list" || saved === "calendar") {
      setViewMode(saved)
    }
  }, [])

  useEffect(() => {
    const dismissedFor = sessionStorage.getItem(TEAM_NEXT_MONTH_NOTICE_KEY)
    setNoticeDismissed(dismissedFor === previewMonth)
  }, [previewMonth])

  function changeView(mode: ViewMode) {
    setViewMode(mode)
    sessionStorage.setItem(VIEW_STORAGE_KEY, mode)
  }

  function goToNextMonth() {
    setMonth(previewMonth)
  }

  function goToPreviousMonth() {
    setMonth(shiftMonthKey(month, -1))
  }

  function dismissNextMonthNotice() {
    sessionStorage.setItem(TEAM_NEXT_MONTH_NOTICE_KEY, previewMonth)
    setNoticeDismissed(true)
  }

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [currentResult, aheadResult] = await Promise.all([
        fetchMonthEntries(month),
        fetchMonthEntries(previewMonth),
      ])

      if (currentResult.res.status === 401 || aheadResult.res.status === 401) {
        router.push("/team")
        return
      }

      if (!currentResult.res.ok) {
        setError(currentResult.data.error ?? "Failed to load calendar.")
        return
      }

      setEntries(currentResult.data.entries ?? [])
      setNextMonthEntries(aheadResult.res.ok ? (aheadResult.data.entries ?? []) : [])
    } catch {
      setError("Failed to load calendar.")
    } finally {
      setLoading(false)
    }
  }, [month, previewMonth, router])

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

  const { year, month: monthNum } = parseMonthKey(month)
  const monthLabel = formatMonthLabel(year, monthNum)
  const showNextMonthNotice =
    month === currentMonthKey() && nextMonthEntries.length > 0

  async function handleLogout() {
    await fetch("/api/team/logout", { method: "POST" })
    router.push("/team")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border-brand bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/one.png"
              alt="Sauraha Nepal"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
                Team Content Calendar
              </h1>
              <p className="text-sm text-text-light">View-only monthly content plan</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
            >
              Main site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:border-orange-brand hover:text-orange-brand"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CalendarSummary entries={monthEntries} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
            >
              ← Previous month
            </button>
            <button
              type="button"
              onClick={() => setMonth(currentMonthKey())}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                month === currentMonthKey()
                  ? "border-green-brand bg-green-brand text-white"
                  : "border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
              }`}
            >
              This month
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                viewingNextMonth
                  ? "border-orange-brand bg-orange-brand text-white"
                  : "border-border-brand bg-white text-text-mid hover:border-orange-brand hover:text-orange-brand"
              }`}
            >
              Next month →
            </button>
          </div>
        </div>

        {showNextMonthNotice && (
          <TeamNextMonthNotice
            nextMonth={previewMonth}
            entries={nextMonthEntries}
            dismissed={noticeDismissed}
            onDismiss={dismissNextMonthNotice}
            onViewNextMonth={goToNextMonth}
          />
        )}

        {!showNextMonthNotice && viewingNextMonth && monthEntries.length > 0 && (
          <p className="mt-6 rounded-2xl border border-green-mid/30 bg-green-mid/10 px-4 py-3 text-sm text-text-mid">
            Viewing <span className="font-semibold text-green-brand">{monthLabel}</span> —{" "}
            {monthEntries.length} item{monthEntries.length === 1 ? "" : "s"} planned.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeView("list")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === "list"
                ? "bg-green-brand text-white"
                : "bg-white text-text-mid hover:bg-cream"
            }`}
          >
            📋 List View
          </button>
          <button
            type="button"
            onClick={() => changeView("calendar")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === "calendar"
                ? "bg-green-brand text-white"
                : "bg-white text-text-mid hover:bg-cream"
            }`}
          >
            📅 Calendar View
          </button>
        </div>

        <div className="mt-6">
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
          ) : viewMode === "list" ? (
            <CalendarListView entries={filteredEntries} />
          ) : (
            <CalendarGridView
              entries={filteredEntries}
              month={month}
              onMonthChange={setMonth}
            />
          )}
        </div>
      </main>
    </div>
  )
}
