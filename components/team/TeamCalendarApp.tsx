"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import CalendarFilters from "@/components/calendar/CalendarFilters"
import CalendarGridView from "@/components/calendar/CalendarGridView"
import CalendarListView from "@/components/calendar/CalendarListView"
import CalendarMobileToolbar from "@/components/calendar/CalendarMobileToolbar"
import CalendarSummary from "@/components/calendar/CalendarSummary"
import TeamNoticeBoard from "@/components/team/TeamNoticeBoard"
import TeamPageHeader from "@/components/team/TeamPageHeader"
import TeamShell from "@/components/team/TeamShell"
import TeamNextMonthNotice, {
  TEAM_NEXT_MONTH_NOTICE_KEY,
} from "@/components/team/TeamNextMonthNotice"
import {
  countActiveCalendarFilters,
  currentMonthKey,
  filterCalendarEntries,
  formatMonthLabel,
  nextMonthKey,
  parseMonthKey,
  shiftMonthKey,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"
import type { TeamNotice } from "@/lib/team-notices"
import { useIsMobile } from "@/lib/use-media-query"

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
  const [notices, setNotices] = useState<TeamNotice[]>([])
  const [noticesLoading, setNoticesLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [month, setMonth] = useState(currentMonthKey())
  const [platform, setPlatform] = useState("All")
  const [status, setStatus] = useState("All")
  const [owner, setOwner] = useState("All")
  const [search, setSearch] = useState("")
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const isMobile = useIsMobile()
  const activeFilterCount = countActiveCalendarFilters({ platform, status, owner })

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

  const loadNotices = useCallback(async () => {
    setNoticesLoading(true)
    try {
      const res = await fetch("/api/team/notices")
      if (res.status === 401) {
        router.push("/team")
        return
      }
      const data = (await res.json()) as { notices?: TeamNotice[] }
      if (res.ok) {
        setNotices(data.notices ?? [])
      }
    } catch {
      // Notice board is supplementary — don't block the calendar on failure
    } finally {
      setNoticesLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

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

  return (
    <TeamShell>
      <TeamPageHeader
        page="calendar"
        title="Team Content Calendar"
        subtitle="View-only monthly content plan"
      />

      <main className="team-main">
        <TeamNoticeBoard notices={notices} loading={noticesLoading} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CalendarSummary entries={monthEntries} teamLayout />
          <div className="hidden flex-wrap gap-2 md:flex">
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
          <p className="team-body-text mt-5 rounded-2xl border border-green-mid/30 bg-green-mid/10 px-3 py-3 sm:mt-6 sm:px-4">
            Viewing <span className="font-semibold text-green-brand">{monthLabel}</span> —{" "}
            {monthEntries.length} item{monthEntries.length === 1 ? "" : "s"} planned.
          </p>
        )}

        <div className="mt-6 hidden flex-wrap gap-2 md:flex">
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

        <div className="mt-5 sm:mt-6">
          <CalendarMobileToolbar
            month={month}
            search={search}
            filtersExpanded={filtersExpanded}
            activeFilterCount={activeFilterCount}
            onMonthChange={setMonth}
            onSearchChange={setSearch}
            onFiltersExpandedChange={setFiltersExpanded}
            showThisMonth
            currentMonthKey={currentMonthKey()}
            onThisMonth={() => setMonth(currentMonthKey())}
            teamLayout
          />
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
            mobileFiltersExpanded={filtersExpanded}
          />
        </div>

        {error && (
          <p role="alert" className="team-body-text mt-4 font-semibold text-orange-brand">
            {error}
          </p>
        )}

        <div className="mt-5 sm:mt-6">
          {loading ? (
            <div className="rounded-2xl border border-border-brand bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
              <p className="team-empty-state">Loading calendar…</p>
            </div>
          ) : viewMode === "list" || isMobile ? (
            <CalendarListView entries={filteredEntries} teamLayout />
          ) : (
            <CalendarGridView
              entries={filteredEntries}
              month={month}
              onMonthChange={setMonth}
            />
          )}
        </div>
      </main>
    </TeamShell>
  )
}
