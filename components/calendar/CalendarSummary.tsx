"use client"

import type { ContentCalendarEntry } from "@/lib/content-calendar"
import { monthStats, statusBreakdown, statusDotClass } from "@/lib/content-calendar"

export default function CalendarSummary({
  entries,
  teamLayout = false,
}: {
  entries: ContentCalendarEntry[]
  teamLayout?: boolean
}) {
  const stats = monthStats(entries)
  const breakdown = statusBreakdown(entries)

  const pillClass = teamLayout
    ? "team-stat-pill shrink-0"
    : "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3 sm:py-1.5 sm:text-sm"

  const legendClass = teamLayout
    ? "team-meta mt-1.5 flex items-center gap-3 overflow-x-auto whitespace-nowrap sm:mt-2 sm:gap-4"
    : "mt-1.5 flex items-center gap-3 overflow-x-auto whitespace-nowrap text-[0.65rem] text-text-light sm:mt-2 sm:gap-4 sm:text-xs"

  return (
    <div className="space-y-2 sm:space-y-3">
      <div
        className={`flex items-center gap-1.5 overflow-x-auto whitespace-nowrap sm:gap-2 ${
          teamLayout ? "" : "text-xs sm:text-sm"
        }`}
      >
        <span className={`${pillClass} bg-orange-brand/10 text-orange-brand`}>
          {stats.scheduled} scheduled
        </span>
        <span className={`${pillClass} bg-green-mid/15 text-green-brand`}>
          {stats.published} published
        </span>
        <span className={`${pillClass} bg-gray-200 text-gray-700`}>
          {stats.drafts} drafts
        </span>
      </div>

      {stats.total > 0 && (
        <div>
          <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 sm:h-3">
            {breakdown.published > 0 && (
              <div
                className="bg-green-brand"
                style={{ width: `${breakdown.published}%` }}
                title={`Published ${breakdown.published}%`}
              />
            )}
            {breakdown.scheduled > 0 && (
              <div
                className="bg-orange-brand"
                style={{ width: `${breakdown.scheduled}%` }}
                title={`Scheduled ${breakdown.scheduled}%`}
              />
            )}
            {breakdown.drafts > 0 && (
              <div
                className="bg-gray-400"
                style={{ width: `${breakdown.drafts}%` }}
                title={`Draft ${breakdown.drafts}%`}
              />
            )}
          </div>
          <div className={legendClass}>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusDotClass("published")}`} />
              Published {breakdown.published}%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusDotClass("scheduled")}`} />
              Scheduled {breakdown.scheduled}%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusDotClass("draft")}`} />
              Draft {breakdown.drafts}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
