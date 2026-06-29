"use client"

import {
  formatCalendarDate,
  platformBadgeClass,
  platformIcon,
  statusBadgeClass,
  statusLabel,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

export function CalendarEntryDetailBody({
  entry,
  teamLayout = false,
}: {
  entry: ContentCalendarEntry
  teamLayout?: boolean
}) {
  const titleClass = teamLayout
    ? "team-card-title mt-2 text-text-brand"
    : "mt-2 font-semibold text-text-brand"
  const metaClass = teamLayout ? "team-meta mt-1 text-text-mid" : "mt-1 text-sm text-text-mid"
  const notesClass = teamLayout ? "team-body-text mt-3 text-text-light" : "mt-2 text-sm text-text-light"
  const linkClass = teamLayout
    ? "team-meta mt-3 inline-block font-semibold text-green-brand hover:underline"
    : "mt-2 inline-block text-sm font-semibold text-green-brand hover:underline"
  const badgeClass = teamLayout
    ? "team-meta inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold"
    : "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${badgeClass} ${platformBadgeClass(entry.platform)}`}>
          <span aria-hidden>{platformIcon(entry.platform)}</span>
          {entry.platform}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(entry.status)}`}>
          {statusLabel(entry.status)}
        </span>
      </div>
      <h4 className={titleClass}>{entry.content_title}</h4>
      <p className={metaClass}>Alloted: {entry.owner}</p>
      {entry.notes && <p className={notesClass}>{entry.notes}</p>}
      {entry.link && (
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          onClick={(e) => e.stopPropagation()}
        >
          Open link ↗
        </a>
      )}
    </>
  )
}

type CalendarEntryDetailModalProps = {
  entry: ContentCalendarEntry | null
  onClose: () => void
  teamLayout?: boolean
}

export default function CalendarEntryDetailModal({
  entry,
  onClose,
  teamLayout = false,
}: CalendarEntryDetailModalProps) {
  if (!entry) return null

  const headingClass = teamLayout
    ? "team-section-title text-green-brand"
    : "font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-detail-title"
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="entry-detail-title" className={headingClass}>
              {formatCalendarDate(entry.scheduled_date)}
            </h3>
            <p className={teamLayout ? "team-meta mt-1" : "mt-1 text-sm text-text-light"}>
              Content calendar entry
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-border-brand px-3 py-1 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border-brand bg-cream/40 p-4">
          <CalendarEntryDetailBody entry={entry} teamLayout={teamLayout} />
        </div>
      </div>
    </div>
  )
}
