"use client"

import { formatMonthLabel, parseMonthKey, shiftMonthKey } from "@/lib/content-calendar"

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
  teamLayout?: boolean
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
  teamLayout = false,
}: CalendarMobileToolbarProps) {
  const { year, month: monthNum } = parseMonthKey(month)
  const monthLabel = formatMonthLabel(year, monthNum)
  const viewingCurrentMonth = currentMonthKey ? month === currentMonthKey : false

  const inputClass = teamLayout
    ? "team-input"
    : "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

  const filterBtnClass = teamLayout
    ? "team-nav-btn relative flex shrink-0 cursor-pointer items-center gap-1.5 border border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
    : "relative flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border-brand bg-white px-3 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"

  const monthTitleClass = teamLayout
    ? "team-section-title truncate"
    : "truncate font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand"

  const jumpClass = teamLayout
    ? "team-meta mt-0.5 cursor-pointer font-semibold text-orange-brand hover:underline"
    : "mt-0.5 cursor-pointer text-xs font-semibold text-orange-brand hover:underline"

  const iconBtnClass = teamLayout
    ? "team-icon-btn cursor-pointer font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
    : "flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-brand bg-white text-lg font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"

  return (
    <div
      className={`sticky top-0 z-30 border-b border-border-brand bg-cream/95 backdrop-blur-sm md:hidden ${
        teamLayout ? "-mx-[clamp(0.75rem,0.5rem+1.5vw,2rem)] px-[clamp(0.75rem,0.5rem+1.5vw,2rem)] py-3" : "-mx-4 px-4 py-3"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(month, -1))}
          aria-label="Previous month"
          className={iconBtnClass}
        >
          ←
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className={monthTitleClass}>{monthLabel}</p>
          {showThisMonth && onThisMonth && !viewingCurrentMonth && (
            <button type="button" onClick={onThisMonth} className={jumpClass}>
              Jump to this month
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(month, 1))}
          aria-label="Next month"
          className={iconBtnClass}
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
          className={filterBtnClass}
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
