import { CheckCircle, Clock, XCircle } from "lucide-react"
import { getOpenStatus } from "@/lib/opening-hours"

const ICON_SIZE = 12

export default function OpenNowBadge({
  openingHours,
  className = "",
}: {
  openingHours: string | null | undefined
  className?: string
}) {
  const hours = openingHours?.trim() ?? ""
  if (!hours) return null

  const status = getOpenStatus(hours)
  if (status === null) return null

  const base = ["inline-flex items-center gap-1.5 text-xs font-medium", className]
    .filter(Boolean)
    .join(" ")

  if (status === "open") {
    return (
      <span
        className={`${base} rounded-full bg-green-mid/15 px-2.5 py-0.5 text-green-brand`}
        aria-label="Open now"
      >
        <CheckCircle size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
        Open Now
      </span>
    )
  }

  return (
    <span
      className={`${base} rounded-full bg-red-100 px-2.5 py-0.5 text-red-600`}
      aria-label="Closed"
    >
      <XCircle size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
      Closed
    </span>
  )
}
