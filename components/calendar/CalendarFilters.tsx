"use client"

import {
  CALENDAR_PLATFORMS,
  CALENDAR_STATUSES,
  currentMonthKey,
  statusLabel,
  uniqueOwners,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

const selectClass =
  "rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

const inputClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

function monthOptions() {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let offset = -6; offset <= 12; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    options.push({ value, label })
  }
  return options
}

type CalendarFiltersProps = {
  month: string
  platform: string
  status: string
  owner: string
  search: string
  allEntries: ContentCalendarEntry[]
  onMonthChange: (value: string) => void
  onPlatformChange: (value: string) => void
  onStatusChange: (value: string) => void
  onOwnerChange: (value: string) => void
  onSearchChange: (value: string) => void
  mobileFiltersExpanded?: boolean
}

function SecondaryFilters({
  platform,
  status,
  owner,
  allEntries,
  onPlatformChange,
  onStatusChange,
  onOwnerChange,
}: Pick<
  CalendarFiltersProps,
  | "platform"
  | "status"
  | "owner"
  | "allEntries"
  | "onPlatformChange"
  | "onStatusChange"
  | "onOwnerChange"
>) {
  const owners = uniqueOwners(allEntries)

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-text-light">Platform</span>
        <select
          className={`${selectClass} w-full`}
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
        >
          <option value="All">All</option>
          {CALENDAR_PLATFORMS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-text-light">Status</span>
        <select
          className={`${selectClass} w-full`}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="All">All</option>
          {CALENDAR_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-text-light">Owner</span>
        <select
          className={`${selectClass} w-full`}
          value={owner}
          onChange={(e) => onOwnerChange(e.target.value)}
        >
          <option value="All">All</option>
          {owners.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

export default function CalendarFilters({
  month,
  platform,
  status,
  owner,
  search,
  allEntries,
  onMonthChange,
  onPlatformChange,
  onStatusChange,
  onOwnerChange,
  onSearchChange,
  mobileFiltersExpanded = false,
}: CalendarFiltersProps) {
  const months = monthOptions()

  return (
    <>
      <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-text-light">Month</span>
          <select
            className={`${selectClass} w-full`}
            value={month || currentMonthKey()}
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {months.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <SecondaryFilters
          platform={platform}
          status={status}
          owner={owner}
          allEntries={allEntries}
          onPlatformChange={onPlatformChange}
          onStatusChange={onStatusChange}
          onOwnerChange={onOwnerChange}
        />

        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-xs font-semibold text-text-light">Search</span>
          <input
            type="search"
            className={inputClass}
            placeholder="Filter by title…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>

      {mobileFiltersExpanded && (
        <div className="mt-3 grid gap-3 rounded-2xl border border-border-brand bg-white p-4 md:hidden">
          <SecondaryFilters
            platform={platform}
            status={status}
            owner={owner}
            allEntries={allEntries}
            onPlatformChange={onPlatformChange}
            onStatusChange={onStatusChange}
            onOwnerChange={onOwnerChange}
          />
        </div>
      )}
    </>
  )
}
