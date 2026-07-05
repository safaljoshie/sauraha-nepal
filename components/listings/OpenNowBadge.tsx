import { Circle, Clock } from "lucide-react"
import { getOpenStatus } from "@/lib/opening-hours"

const ICON_SIZE = 12

export default function OpenNowBadge({
  openingHours,
}: {
  openingHours: string | null | undefined
}) {
  const hours = openingHours?.trim() ?? ""
  if (!hours) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted"
        aria-label="Hours not listed"
      >
        <Clock size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
        Hours not listed
      </span>
    )
  }

  const status = getOpenStatus(hours)
  if (status === null) return null

  if (status === "open") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium text-green-brand"
        aria-label="Open now"
      >
        <Circle
          size={ICON_SIZE}
          className="fill-green-brand text-green-brand"
          strokeWidth={2.25}
          aria-hidden
        />
        Open Now
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600"
      aria-label="Closed"
    >
      <Circle
        size={ICON_SIZE}
        className="fill-red-600 text-red-600"
        strokeWidth={2.25}
        aria-hidden
      />
      Closed
    </span>
  )
}
