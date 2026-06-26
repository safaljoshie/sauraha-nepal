"use client"

import {
  formatMonthLabel,
  monthStats,
  parseMonthKey,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

export const TEAM_NEXT_MONTH_NOTICE_KEY = "team-calendar-next-month-notice"

type TeamNextMonthNoticeProps = {
  nextMonth: string
  entries: ContentCalendarEntry[]
  dismissed: boolean
  onDismiss: () => void
  onViewNextMonth: () => void
}

export default function TeamNextMonthNotice({
  nextMonth,
  entries,
  dismissed,
  onDismiss,
  onViewNextMonth,
}: TeamNextMonthNoticeProps) {
  const { year, month } = parseMonthKey(nextMonth)
  const label = formatMonthLabel(year, month)
  const stats = monthStats(entries)
  const scheduledCount = entries.filter((e) => e.status !== "published").length

  if (entries.length === 0 || dismissed) return null

  return (
    <div
      role="status"
      className="mt-5 rounded-2xl border border-orange-brand/30 bg-orange-brand/10 px-3 py-3.5 sm:mt-6 sm:px-4 sm:py-4 md:flex md:items-center md:justify-between md:gap-4"
    >
      <div>
        <p className="team-card-title text-orange-brand">Upcoming next month</p>
        <p className="team-body-text mt-1">
          <span className="font-semibold text-text-brand">{label}</span> has{" "}
          <span className="font-semibold text-text-brand">
            {entries.length} planned item{entries.length === 1 ? "" : "s"}
          </span>
          {scheduledCount > 0 && (
            <>
              {" "}
              ({scheduledCount} still draft or scheduled)
            </>
          )}
          {stats.published > 0 && (
            <>
              {" "}
              · {stats.published} already published
            </>
          )}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
        <button
          type="button"
          onClick={onViewNextMonth}
          className="team-action-btn cursor-pointer rounded-full bg-orange-brand text-white hover:bg-orange-brand/90"
        >
          View {label}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="team-nav-btn cursor-pointer border border-orange-brand/40 bg-white text-text-mid hover:text-orange-brand"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
