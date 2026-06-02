import { getOpenStatus } from "@/lib/opening-hours"

export default function OpenNowBadge({ openingHours }: { openingHours: string }) {
  const status = getOpenStatus(openingHours)
  if (!status) return null

  if (status === "open") {
    return (
      <span className="text-xs font-medium text-green-brand" aria-label="Open now">
        🟢 Open Now
      </span>
    )
  }

  return (
    <span className="text-xs font-medium text-red-600" aria-label="Closed">
      🔴 Closed
    </span>
  )
}
