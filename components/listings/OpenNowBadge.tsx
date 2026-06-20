import { getOpenStatus } from "@/lib/opening-hours"

export default function OpenNowBadge({ openingHours }: { openingHours: string }) {
  const status = getOpenStatus(openingHours)
  if (!status) return null

  if (status === "open") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium text-green-brand"
        aria-label="Open now"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-green-brand" aria-hidden />
        Open Now
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600"
      aria-label="Closed"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-red-600" aria-hidden />
      Closed
    </span>
  )
}
