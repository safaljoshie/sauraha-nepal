export const CALENDAR_PLATFORMS = [
  "Instagram",
  "Facebook",
  "Website",
  "TikTok",
  "Twitter/X",
  "YouTube",
  "WhatsApp",
] as const

export type CalendarPlatform = (typeof CALENDAR_PLATFORMS)[number]

export const CALENDAR_STATUSES = ["draft", "scheduled", "published"] as const

export type CalendarStatus = (typeof CALENDAR_STATUSES)[number]

export type ContentCalendarEntry = {
  id: string
  created_at: string
  updated_at: string
  scheduled_date: string
  content_title: string
  platform: string
  status: string
  owner: string
  notes: string | null
  link: string | null
}

export type ContentCalendarPayload = {
  scheduled_date: string
  content_title: string
  platform: string
  status: string
  owner: string
  notes?: string | null
  link?: string | null
}

export type CalendarFilters = {
  month?: string
  platform?: string
  status?: string
  owner?: string
  search?: string
}

export function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-mid/15 text-green-brand"
    case "scheduled":
      return "bg-orange-brand/15 text-orange-brand"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

export function statusDotClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-brand"
    case "scheduled":
      return "bg-orange-brand"
    default:
      return "bg-gray-400"
  }
}

export function platformBadgeClass(platform: string) {
  switch (platform) {
    case "Instagram":
      return "bg-pink-100 text-pink-800"
    case "Facebook":
      return "bg-blue-100 text-blue-800"
    case "Website":
      return "bg-green-mid/15 text-green-brand"
    case "TikTok":
      return "bg-gray-900 text-white"
    case "Twitter/X":
      return "bg-sky-100 text-sky-800"
    case "YouTube":
      return "bg-red-100 text-red-800"
    case "WhatsApp":
      return "bg-emerald-100 text-emerald-800"
    default:
      return "bg-cream text-text-mid"
  }
}

export function platformIcon(platform: string) {
  switch (platform) {
    case "Instagram":
      return "📸"
    case "Facebook":
      return "📘"
    case "Website":
      return "🌐"
    case "TikTok":
      return "🎵"
    case "Twitter/X":
      return "🐦"
    case "YouTube":
      return "▶️"
    case "WhatsApp":
      return "💬"
    default:
      return "📌"
  }
}

export function cycleStatus(current: string): CalendarStatus {
  const order: CalendarStatus[] = ["draft", "scheduled", "published"]
  const index = order.indexOf(current as CalendarStatus)
  return order[(index + 1) % order.length] ?? "draft"
}

export function formatCalendarDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

export function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function parseMonthKey(key: string) {
  const [yearRaw, monthRaw] = key.split("-")
  return {
    year: Number.parseInt(yearRaw ?? "", 10),
    month: Number.parseInt(monthRaw ?? "", 10),
  }
}

export function currentMonthKey() {
  const now = new Date()
  return toMonthKey(now.getFullYear(), now.getMonth() + 1)
}

export function shiftMonthKey(monthKey: string, deltaMonths: number) {
  const { year, month } = parseMonthKey(monthKey)
  const date = new Date(year, month - 1 + deltaMonths, 1)
  return toMonthKey(date.getFullYear(), date.getMonth() + 1)
}

export function nextMonthKey(monthKey?: string) {
  return shiftMonthKey(monthKey ?? currentMonthKey(), 1)
}

export function monthDateRange(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey)
  const start = `${monthKey}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${monthKey}-${String(lastDay).padStart(2, "0")}`
  return { start, end }
}

export type DuplicateInterval = "day" | "week" | "month"

export const DUPLICATE_INTERVAL_LABELS: Record<DuplicateInterval, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
}

export function shiftScheduledDate(dateStr: string, interval: DuplicateInterval) {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  switch (interval) {
    case "day":
      date.setDate(date.getDate() + 1)
      break
    case "week":
      date.setDate(date.getDate() + 7)
      break
    case "month":
      date.setMonth(date.getMonth() + 1)
      break
  }

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addOneMonth(dateStr: string) {
  return shiftScheduledDate(dateStr, "month")
}

export function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startPadding = firstDay.getDay()
  const cells: Array<{ date: string | null; day: number | null }> = []

  for (let i = 0; i < startPadding; i += 1) {
    cells.push({ date: null, day: null })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    cells.push({ date, day })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null })
  }

  return cells
}

export function isToday(dateStr: string) {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  return dateStr === `${y}-${m}-${d}`
}

export function filterCalendarEntries(
  entries: ContentCalendarEntry[],
  filters: CalendarFilters,
) {
  let result = [...entries]

  if (filters.month) {
    const { start, end } = monthDateRange(filters.month)
    result = result.filter(
      (entry) => entry.scheduled_date >= start && entry.scheduled_date <= end,
    )
  }

  if (filters.platform && filters.platform !== "All") {
    result = result.filter((entry) => entry.platform === filters.platform)
  }

  if (filters.status && filters.status !== "All") {
    result = result.filter(
      (entry) => entry.status.toLowerCase() === filters.status?.toLowerCase(),
    )
  }

  if (filters.owner && filters.owner !== "All") {
    result = result.filter((entry) => entry.owner === filters.owner)
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter((entry) =>
      entry.content_title.toLowerCase().includes(q),
    )
  }

  return result.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
}

export function monthStats(entries: ContentCalendarEntry[]) {
  const scheduled = entries.filter((e) => e.status === "scheduled").length
  const published = entries.filter((e) => e.status === "published").length
  const drafts = entries.filter((e) => e.status === "draft").length
  const total = entries.length
  return { scheduled, published, drafts, total }
}

export function statusBreakdown(entries: ContentCalendarEntry[]) {
  const { scheduled, published, drafts, total } = monthStats(entries)
  if (total === 0) {
    return { scheduled: 0, published: 0, drafts: 0 }
  }
  return {
    scheduled: Math.round((scheduled / total) * 100),
    published: Math.round((published / total) * 100),
    drafts: Math.round((drafts / total) * 100),
  }
}

export function uniqueOwners(entries: ContentCalendarEntry[]) {
  return [...new Set(entries.map((entry) => entry.owner).filter(Boolean))].sort()
}

export function normalizeCalendarPayload(body: Partial<ContentCalendarPayload>) {
  const scheduled_date = body.scheduled_date?.trim() ?? ""
  const content_title = body.content_title?.trim() ?? ""
  const platform = body.platform?.trim() ?? ""
  const status = (body.status?.trim().toLowerCase() ?? "draft") as CalendarStatus
  const owner = body.owner?.trim() ?? ""
  const notes = body.notes?.trim() || null
  const link = body.link?.trim() || null

  if (!scheduled_date || !content_title || !platform || !owner) {
    return { error: "Scheduled date, content title, platform, and owner are required." }
  }

  if (!CALENDAR_PLATFORMS.includes(platform as CalendarPlatform)) {
    return { error: "Invalid platform." }
  }

  if (!CALENDAR_STATUSES.includes(status)) {
    return { error: "Invalid status." }
  }

  return {
    data: { scheduled_date, content_title, platform, status, owner, notes, link },
  }
}
