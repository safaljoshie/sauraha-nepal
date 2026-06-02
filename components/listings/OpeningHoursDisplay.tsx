import { isOpenNow } from "@/lib/opening-hours"

export default function OpeningHoursDisplay({ hours }: { hours: string }) {
  const open = isOpenNow(hours)

  return (
    <section className="rounded-2xl border border-border-brand bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
          Opening Hours
        </h2>
        {open !== null && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              open ? "bg-green-mid/15 text-green-brand" : "bg-red-100 text-red-700"
            }`}
          >
            {open ? "Open now" : "Closed"}
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text-mid">{hours}</p>
      <p className="mt-2 text-xs text-text-light">Times shown in Nepal Time (NPT, UTC+5:45)</p>
    </section>
  )
}
