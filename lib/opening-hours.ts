const NEPAL_TZ = "Asia/Kathmandu"

type TimeRange = { start: number; end: number }

function parseTimeToMinutes(token: string): number | null {
  const t = token.trim().toLowerCase()
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0
  const meridiem = match[3]

  if (meridiem === "pm" && hours < 12) hours += 12
  if (meridiem === "am" && hours === 12) hours = 0
  if (!meridiem && hours >= 24) return null

  return hours * 60 + minutes
}

function parseRangeLine(line: string): TimeRange | null {
  const parts = line.split(/–|—|-/).map((p) => p.trim())
  if (parts.length !== 2) return null
  const start = parseTimeToMinutes(parts[0])
  const end = parseTimeToMinutes(parts[1])
  if (start === null || end === null) return null
  return { start, end }
}

export function getNepalNowMinutes(): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: NEPAL_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date())
  const hour = Number.parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10)
  const minute = Number.parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10)
  return hour * 60 + minute
}

export function isOpenNow(openingHours: string): boolean | null {
  const lines = openingHours
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  const ranges: TimeRange[] = []
  for (const line of lines) {
    const withoutDay = line.replace(/^[a-z]+[:\s]+/i, "").trim()
    const range = parseRangeLine(withoutDay) ?? parseRangeLine(line)
    if (range) ranges.push(range)
  }

  if (ranges.length === 0) {
    const single = parseRangeLine(openingHours.trim())
    if (!single) return null
    ranges.push(single)
  }

  const now = getNepalNowMinutes()
  return ranges.some((range) => {
    if (range.start <= range.end) {
      return now >= range.start && now < range.end
    }
    return now >= range.start || now < range.end
  })
}
