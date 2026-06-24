"use client"

import type { ContentCalendarEntry } from "@/lib/content-calendar"
import { monthStats, statusBreakdown, statusDotClass } from "@/lib/content-calendar"

export default function CalendarSummary({ entries }: { entries: ContentCalendarEntry[] }) {
  const stats = monthStats(entries)
  const breakdown = statusBreakdown(entries)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs sm:gap-2 sm:text-sm">
        <span className="shrink-0 rounded-full bg-orange-brand/10 px-2.5 py-1 font-semibold text-orange-brand sm:px-3 sm:py-1.5">
          {stats.scheduled} scheduled
        </span>
        <span className="shrink-0 rounded-full bg-green-mid/15 px-2.5 py-1 font-semibold text-green-brand sm:px-3 sm:py-1.5">
          {stats.published} published
        </span>
        <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 font-semibold text-gray-700 sm:px-3 sm:py-1.5">
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
          <div className="mt-1.5 flex items-center gap-3 overflow-x-auto whitespace-nowrap text-[0.65rem] text-text-light sm:mt-2 sm:gap-4 sm:text-xs">
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
