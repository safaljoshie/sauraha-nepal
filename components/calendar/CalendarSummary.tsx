"use client"

import type { ContentCalendarEntry } from "@/lib/content-calendar"
import { monthStats, statusBreakdown, statusDotClass } from "@/lib/content-calendar"

export default function CalendarSummary({ entries }: { entries: ContentCalendarEntry[] }) {
  const stats = monthStats(entries)
  const breakdown = statusBreakdown(entries)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-orange-brand/10 px-4 py-1.5 text-sm font-semibold text-orange-brand">
          {stats.scheduled} scheduled this month
        </span>
        <span className="rounded-full bg-green-mid/15 px-4 py-1.5 text-sm font-semibold text-green-brand">
          {stats.published} published
        </span>
        <span className="rounded-full bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700">
          {stats.drafts} drafts
        </span>
      </div>

      {stats.total > 0 && (
        <div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-200">
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
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-light">
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
