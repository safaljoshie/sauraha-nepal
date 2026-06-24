"use client"

import { formatMonthLabel, parseMonthKey, shiftMonthKey } from "@/lib/content-calendar"

const inputClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

type CalendarMobileToolbarProps = {
  month: string
  search: string
  filtersExpanded: boolean
  activeFilterCount: number
  onMonthChange: (value: string) => void
  onSearchChange: (value: string) => void
  onFiltersExpandedChange: (value: boolean) => void
  showThisMonth?: boolean
  currentMonthKey?: string
  onThisMonth?: () => void
}

export default function CalendarMobileToolbar({
  month,
  search,
  filtersExpanded,
  activeFilterCount,
  onMonthChange,
  onSearchChange,
  onFiltersExpandedChange,
  showThisMonth,
  currentMonthKey,
  onThisMonth,
}: CalendarMobileToolbarProps) {
  const { year, month: monthNum } = parseMonthKey(month)
  const monthLabel = formatMonthLabel(year, monthNum)
  const viewingCurrentMonth = currentMonthKey ? month === currentMonthKey : false

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-border-brand bg-cream/95 px-4 py-3 backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(month, -1))}
          aria-label="Previous month"
          className="flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-brand bg-white text-lg font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
        >
          ←
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand">
            {monthLabel}
          </p>
          {showThisMonth && onThisMonth && !viewingCurrentMonth && (
            <button
              type="button"
              onClick={onThisMonth}
              className="mt-0.5 cursor-pointer text-xs font-semibold text-orange-brand hover:underline"
            >
              Jump to this month
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(month, 1))}
          aria-label="Next month"
          className="flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-brand bg-white text-lg font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
        >
          →
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="search"
          className={inputClass}
          placeholder="Search titles…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search calendar entries"
        />
        <button
          type="button"
          onClick={() => onFiltersExpandedChange(!filtersExpanded)}
          aria-expanded={filtersExpanded}
          className="relative flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border-brand bg-white px-3 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-brand px-1 text-[0.65rem] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
