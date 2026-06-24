"use client"

import { useEffect, useState } from "react"
import {
  DUPLICATE_INTERVAL_LABELS,
  type ContentCalendarEntry,
  type DuplicateInterval,
} from "@/lib/content-calendar"

const DUPLICATE_INTERVALS: DuplicateInterval[] = ["day", "week", "month"]

type CalendarEntryActionsMenuProps = {
  entry: ContentCalendarEntry
  busy?: boolean
  onEdit?: (entry: ContentCalendarEntry) => void
  onDelete?: (entry: ContentCalendarEntry) => void
  onDuplicate?: (entry: ContentCalendarEntry, interval: DuplicateInterval) => void
}

export default function CalendarEntryActionsMenu({
  entry,
  busy,
  onEdit,
  onDelete,
  onDuplicate,
}: CalendarEntryActionsMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function close() {
    setOpen(false)
  }

  function runAction(action: () => void) {
    close()
    action()
  }

  const sheetItemClass =
    "flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-text-brand hover:bg-cream"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        aria-label="Entry actions"
        className="flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-border-brand bg-white text-lg font-bold text-text-mid hover:border-green-mid hover:text-green-brand disabled:opacity-60"
      >
        ⋯
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          role="presentation"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Entry actions"
            className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-border-brand pb-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-light">Actions</p>
                <p className="mt-0.5 truncate font-semibold text-text-brand">
                  {entry.content_title}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="cursor-pointer rounded-full border border-border-brand px-3 py-1.5 text-sm font-semibold text-text-mid"
              >
                Close
              </button>
            </div>

            <div className="space-y-1">
              {onEdit && (
                <button
                  type="button"
                  className={sheetItemClass}
                  onClick={() => runAction(() => onEdit(entry))}
                >
                  Edit entry
                </button>
              )}

              {onDuplicate &&
                DUPLICATE_INTERVALS.map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    className={sheetItemClass}
                    onClick={() => runAction(() => onDuplicate(entry, interval))}
                  >
                    <span>Duplicate {DUPLICATE_INTERVAL_LABELS[interval].toLowerCase()}</span>
                    <span className="text-xs font-normal text-text-light">
                      {interval === "day" ? "+1 day" : interval === "week" ? "+1 week" : "+1 month"}
                    </span>
                  </button>
                ))}

              {onDelete && (
                <button
                  type="button"
                  className={`${sheetItemClass} text-red-700 hover:bg-red-50`}
                  onClick={() => runAction(() => onDelete(entry))}
                >
                  Delete entry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
