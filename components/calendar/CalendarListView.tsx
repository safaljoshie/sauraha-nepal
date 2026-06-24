"use client"

import { useEffect, useRef, useState } from "react"
import {
  DUPLICATE_INTERVAL_LABELS,
  formatCalendarDate,
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

type CalendarListViewProps = {
  entries: ContentCalendarEntry[]
  onStatusClick?: (entry: ContentCalendarEntry) => void
  onEdit?: (entry: ContentCalendarEntry) => void
  onDelete?: (entry: ContentCalendarEntry) => void
  onDuplicate?: (entry: ContentCalendarEntry, interval: DuplicateInterval) => void
  actionBusyId?: string | null
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

export default function CalendarListView({
  entries,
  onStatusClick,
  onEdit,
  onDelete,
  onDuplicate,
  actionBusyId,
}: CalendarListViewProps) {
  const showActions = Boolean(onEdit || onDelete || onDuplicate)

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
        No entries match your filters.
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
              <tr key={entry.id} className="border-b border-border-brand/70 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-text-mid">
                  {formatCalendarDate(entry.scheduled_date)}
                </td>
                <td className="px-4 py-3 font-medium text-text-brand">
                  {entry.link ? (
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-brand hover:underline"
                    >
                      {entry.content_title}
                    </a>
                  ) : (
                    entry.content_title
                  )}
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
                <td className="px-4 py-3">
                  <StatusBadge
                    entry={entry}
                    onClick={onStatusClick ? () => onStatusClick(entry) : undefined}
                    busy={actionBusyId === entry.id}
                  />
                </td>
                <td className="px-4 py-3 text-text-mid">{entry.owner}</td>
                {showActions && (
                  <td className="px-4 py-3">
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

      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-border-brand bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-text-light">
                  {formatCalendarDate(entry.scheduled_date)}
                </p>
                <h3 className="mt-1 font-semibold text-text-brand">{entry.content_title}</h3>
              </div>
              <StatusBadge
                entry={entry}
                onClick={onStatusClick ? () => onStatusClick(entry) : undefined}
                busy={actionBusyId === entry.id}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${platformBadgeClass(entry.platform)}`}
              >
                <span aria-hidden>{platformIcon(entry.platform)}</span>
                {entry.platform}
              </span>
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-text-mid">
                {entry.owner}
              </span>
            </div>
            {entry.notes && (
              <p className="mt-2 text-sm text-text-light">{entry.notes}</p>
            )}
            {showActions && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border-brand pt-3">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className={actionButtonClass}
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
                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
