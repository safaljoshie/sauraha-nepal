import { CheckCircle, Clock, XCircle } from "lucide-react"
import { getOpenStatus } from "@/lib/opening-hours"

const ICON_SIZE = 12

export default function OpeningHoursDisplay({
  hours,
}: {
  hours: string | null | undefined
}) {
  const trimmed = hours?.trim() ?? ""
  const hasHours = trimmed.length > 0
  const status = hasHours ? getOpenStatus(trimmed) : null

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
          Opening Hours
        </h2>
        {!hasHours && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <Clock size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
            Hours not listed
          </span>
        )}
        {hasHours && status === "open" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-mid/15 px-3 py-1 text-xs font-bold text-green-brand">
            <CheckCircle size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
            Open Now
          </span>
        )}
        {hasHours && status === "closed" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
            <XCircle size={ICON_SIZE} strokeWidth={2.25} aria-hidden />
            Closed
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
