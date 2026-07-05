import { Circle, Clock } from "lucide-react"
import { isOpenNow } from "@/lib/opening-hours"

const ICON_SIZE = 12

export default function OpeningHoursDisplay({
  hours,
}: {
  hours: string | null | undefined
}) {
  const trimmed = hours?.trim() ?? ""
  const hasHours = trimmed.length > 0
  const open = hasHours ? isOpenNow(trimmed) : null

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
          Opening Hours
        </h2>
        {!hasHours && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-ink-muted">
            <Clock size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
            Hours not listed
          </span>
        )}
        {hasHours && open !== null && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              open ? "bg-green-mid/15 text-green-brand" : "bg-red-100 text-red-700"
            }`}
          >
            <Circle
              size={ICON_SIZE}
              className={open ? "fill-green-brand text-green-brand" : "fill-red-700 text-red-700"}
              strokeWidth={2.25}
              aria-hidden
            />
            {open ? "Open now" : "Closed"}
          </span>
        )}
      </div>
      {hasHours && (
        <>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text-mid">{trimmed}</p>
          <p className="mt-2 text-xs text-text-light">Times shown in Nepal Time (NPT, UTC+5:45)</p>
        </>
      )}
    </section>
  )
}
