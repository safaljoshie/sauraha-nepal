"use client"

import { useEffect, useRef, useState } from "react"
import CalendarEntryActionsMenu from "@/components/calendar/CalendarEntryActionsMenu"
import CalendarEntryDetailModal from "@/components/calendar/CalendarEntryDetail"
import {
  DUPLICATE_INTERVAL_LABELS,
  formatCalendarDate,
  groupEntriesByDate,
  platformBadgeClass,
  platformIcon,
  statusBadgeClass,
  statusLabel,
  type ContentCalendarEntry,
  type DuplicateInterval,
} from "@/lib/content-calendar"

const DUPLICATE_INTERVALS: DuplicateInterval[] = ["day", "week", "month"]

const actionButtonClass =
  "cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid hover:border-green-mid hover:text-green-brand disabled:opacity-60"

function EntryTitle({ entry }: { entry: ContentCalendarEntry }) {
  if (entry.link) {
    return (
      <a
        href={entry.link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-text-brand hover:text-green-brand hover:underline"
      >
        {entry.content_title}
      </a>
    )
  }

  return <span className="font-semibold text-text-brand">{entry.content_title}</span>
}

function DuplicateActions({
  entry,
  onDuplicate,
  busy,
}: {
  entry: ContentCalendarEntry
  onDuplicate: (entry: ContentCalendarEntry, interval: DuplicateInterval) => void
  busy?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  function handleSelect(interval: DuplicateInterval) {
    setOpen(false)
    onDuplicate(entry, interval)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${actionButtonClass} inline-flex items-center gap-1`}
      >
        Duplicate
        <span aria-hidden className="text-[0.6rem]">
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-border-brand bg-white py-1 shadow-lg"
        >
          {DUPLICATE_INTERVALS.map((interval) => (
            <button
              key={interval}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(interval)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-xs font-semibold text-text-mid hover:bg-cream hover:text-green-brand"
            >
              <span>{DUPLICATE_INTERVAL_LABELS[interval]}</span>
              <span className="text-[0.65rem] font-normal text-text-light">
                {interval === "day" ? "+1 day" : interval === "week" ? "+1 week" : "+1 month"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({
  entry,
  onClick,
  busy,
}: {
  entry: ContentCalendarEntry
  onClick?: () => void
  busy?: boolean
}) {
  const className = `inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(entry.status)} ${
    onClick ? "cursor-pointer hover:opacity-80" : ""
  }`

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={busy}
        title="Click to cycle status"
      >
        {statusLabel(entry.status)}
      </button>
    )
  }

  return <span className={className}>{statusLabel(entry.status)}</span>
}

function MobileEntryCard({
  entry,
  onStatusClick,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  actionBusyId,
  showActions,
  teamLayout = false,
}: {
  entry: ContentCalendarEntry
  onStatusClick?: (entry: ContentCalendarEntry) => void
  onEdit?: (entry: ContentCalendarEntry) => void
  onDelete?: (entry: ContentCalendarEntry) => void
  onDuplicate?: (entry: ContentCalendarEntry, interval: DuplicateInterval) => void
  onViewDetails: (entry: ContentCalendarEntry) => void
  actionBusyId?: string | null
  showActions: boolean
  teamLayout?: boolean
}) {
  const busy = actionBusyId === entry.id
  const titleClass = teamLayout ? "team-card-title leading-snug" : "text-base font-semibold leading-snug text-text-brand"
  const linkClass = teamLayout
    ? "team-meta mt-1 inline-block font-semibold text-green-brand hover:underline"
    : "mt-1 inline-block text-xs font-semibold text-green-brand hover:underline"
  const badgeClass = teamLayout ? "team-meta rounded-full px-2.5 py-1 font-semibold" : "rounded-full px-2.5 py-1 text-xs font-semibold"
  const notesClass = teamLayout ? "team-body-text mt-2 text-text-light" : "mt-2 text-sm text-text-light"

  return (
    <article
      className="cursor-pointer rounded-2xl border border-border-brand bg-white p-3 shadow-sm transition-colors hover:border-green-mid/40 sm:p-4"
      onClick={() => onViewDetails(entry)}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={titleClass}>
            <EntryTitle entry={entry} />
          </h3>
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
        </div>
        <div
          className="flex shrink-0 items-start gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge
            entry={entry}
            onClick={onStatusClick ? () => onStatusClick(entry) : undefined}
            busy={busy}
          />
          {showActions && (onEdit || onDelete || onDuplicate) && (
            <CalendarEntryActionsMenu
              entry={entry}
              busy={busy}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 ${badgeClass} ${platformBadgeClass(entry.platform)}`}
        >
          <span aria-hidden>{platformIcon(entry.platform)}</span>
          {entry.platform}
        </span>
        <span className={`${badgeClass} bg-cream text-text-mid`}>{entry.owner}</span>
      </div>

      {entry.notes && (
        <p className={`${notesClass} line-clamp-2`}>{entry.notes}</p>
      )}
      <p
        className={`${teamLayout ? "team-meta" : "text-xs"} mt-2 font-semibold text-green-brand md:hidden`}
      >
        Tap for full details
      </p>
    </article>
  )
}

type CalendarListViewProps = {
  entries: ContentCalendarEntry[]
  onStatusClick?: (entry: ContentCalendarEntry) => void
  onEdit?: (entry: ContentCalendarEntry) => void
  onDelete?: (entry: ContentCalendarEntry) => void
  onDuplicate?: (entry: ContentCalendarEntry, interval: DuplicateInterval) => void
  actionBusyId?: string | null
  teamLayout?: boolean
}

export default function CalendarListView({
  entries,
  onStatusClick,
  onEdit,
  onDelete,
  onDuplicate,
  actionBusyId,
  teamLayout = false,
}: CalendarListViewProps) {
  const showActions = Boolean(onEdit || onDelete || onDuplicate)
  const groupedEntries = groupEntriesByDate(entries)
  const [selectedEntry, setSelectedEntry] = useState<ContentCalendarEntry | null>(null)

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border-brand bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className={teamLayout ? "team-empty-state" : "text-text-light"}>
          No entries match your filters.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-border-brand bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border-brand bg-cream/60 text-xs font-bold uppercase tracking-wide text-text-light">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              {showActions && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="cursor-pointer border-b border-border-brand/70 transition-colors last:border-0 hover:bg-cream/50"
                onClick={() => setSelectedEntry(entry)}
              >
                <td className="whitespace-nowrap px-4 py-3 text-text-mid">
                  {formatCalendarDate(entry.scheduled_date)}
                </td>
                <td className="px-4 py-3 font-medium text-text-brand">
                  <span onClick={(e) => entry.link && e.stopPropagation()}>
                    <EntryTitle entry={entry} />
                  </span>
                  {entry.notes && (
                    <p className="mt-1 line-clamp-1 text-xs font-normal text-text-light">
                      {entry.notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${platformBadgeClass(entry.platform)}`}
                  >
                    <span aria-hidden>{platformIcon(entry.platform)}</span>
                    {entry.platform}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge
                    entry={entry}
                    onClick={onStatusClick ? () => onStatusClick(entry) : undefined}
                    busy={actionBusyId === entry.id}
                  />
                </td>
                <td className="px-4 py-3 text-text-mid">{entry.owner}</td>
                {showActions && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className={actionButtonClass}
                          disabled={actionBusyId === entry.id}
                        >
                          Edit
                        </button>
                      )}
                      {onDuplicate && (
                        <DuplicateActions
                          entry={entry}
                          onDuplicate={onDuplicate}
                          busy={actionBusyId === entry.id}
                        />
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(entry)}
                          className="cursor-pointer rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                          disabled={actionBusyId === entry.id}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden sm:space-y-5">
        {groupedEntries.map((group) => (
          <section key={group.date}>
            <h3
              className={
                teamLayout
                  ? "team-section-title sticky top-[6.5rem] z-20 -mx-1 mb-2 rounded-lg bg-cream/95 px-2 py-2 backdrop-blur-sm"
                  : "sticky top-[7.25rem] z-20 -mx-1 mb-2 rounded-lg bg-cream/95 px-2 py-2 text-sm font-bold text-green-brand backdrop-blur-sm"
              }
            >
              {formatCalendarDate(group.date)}
            </h3>
            <div className="space-y-3">
              {group.entries.map((entry) => (
                <MobileEntryCard
                  key={entry.id}
                  entry={entry}
                  onStatusClick={onStatusClick}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onViewDetails={setSelectedEntry}
                  actionBusyId={actionBusyId}
                  showActions={showActions}
                  teamLayout={teamLayout}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <CalendarEntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        teamLayout={teamLayout}
      />
    </>
  )
}
