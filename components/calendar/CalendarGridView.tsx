"use client"

import { useMemo, useState } from "react"
import {
  buildMonthGrid,
  formatCalendarDate,
  formatMonthLabel,
  isToday,
  parseMonthKey,
  platformBadgeClass,
  platformIcon,
  statusBadgeClass,
  statusDotClass,
  statusLabel,
  toMonthKey,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type CalendarGridViewProps = {
  entries: ContentCalendarEntry[]
  month: string
  onMonthChange: (monthKey: string) => void
}

export default function CalendarGridView({
  entries,
  month,
  onMonthChange,
}: CalendarGridViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { year, month: monthNum } = parseMonthKey(month)

  const entriesByDate = useMemo(() => {
    const map = new Map<string, ContentCalendarEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.scheduled_date) ?? []
      list.push(entry)
      map.set(entry.scheduled_date, list)
    }
    return map
  }, [entries])

  const grid = buildMonthGrid(year, monthNum)
  const selectedEntries = selectedDate ? (entriesByDate.get(selectedDate) ?? []) : []

  function shiftMonth(delta: number) {
    const date = new Date(year, monthNum - 1 + delta, 1)
    onMonthChange(toMonthKey(date.getFullYear(), date.getMonth() + 1))
  }

  return (
    <div className="rounded-2xl border border-border-brand bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="cursor-pointer rounded-full border border-border-brand px-3 py-1.5 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
        >
          ← Previous
        </button>
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand md:text-xl">
          {formatMonthLabel(year, monthNum)}
        </h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="cursor-pointer rounded-full border border-border-brand px-3 py-1.5 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-text-light">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, index) => {
          if (!cell.date) {
            return <div key={`empty-${index}`} className="min-h-[88px] rounded-xl bg-cream/40" />
          }

          const dayEntries = entriesByDate.get(cell.date) ?? []
          const today = isToday(cell.date)

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`min-h-[88px] cursor-pointer rounded-xl border p-2 text-left transition-colors hover:border-green-mid ${
                today
                  ? "border-green-brand bg-green-mid/10"
                  : "border-border-brand/70 bg-white"
              }`}
            >
              <div className={`text-sm font-bold ${today ? "text-green-brand" : "text-text-brand"}`}>
                {cell.day}
              </div>
              <div className="mt-1 space-y-1">
                {dayEntries.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-1">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(entry.status)}`}
                    />
                    <span className="line-clamp-2 text-[0.65rem] leading-tight text-text-mid">
                      {entry.content_title}
                    </span>
                  </div>
                ))}
                {dayEntries.length > 2 && (
                  <p className="text-[0.65rem] font-semibold text-orange-brand">
                    +{dayEntries.length - 2} more
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
          role="presentation"
          onClick={() => setSelectedDate(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-detail-title"
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="day-detail-title"
                  className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand"
                >
                  {formatCalendarDate(selectedDate)}
                </h3>
                <p className="mt-1 text-sm text-text-light">
                  {selectedEntries.length} entr{selectedEntries.length === 1 ? "y" : "ies"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="cursor-pointer rounded-full border border-border-brand px-3 py-1 text-sm font-semibold text-text-mid"
              >
                Close
              </button>
            </div>

            {selectedEntries.length === 0 ? (
              <p className="mt-4 text-sm text-text-light">No content scheduled for this day.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {selectedEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-border-brand bg-cream/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${platformBadgeClass(entry.platform)}`}
                      >
                        <span aria-hidden>{platformIcon(entry.platform)}</span>
                        {entry.platform}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(entry.status)}`}
                      >
                        {statusLabel(entry.status)}
                      </span>
                    </div>
                    <h4 className="mt-2 font-semibold text-text-brand">{entry.content_title}</h4>
                    <p className="mt-1 text-sm text-text-mid">Owner: {entry.owner}</p>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-text-light">{entry.notes}</p>
                    )}
                    {entry.link && (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-green-brand hover:underline"
                      >
                        Open link
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
