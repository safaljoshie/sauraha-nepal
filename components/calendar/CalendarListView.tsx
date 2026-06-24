"use client"

import {
  formatCalendarDate,
  platformBadgeClass,
  platformIcon,
  statusBadgeClass,
  statusLabel,
  type ContentCalendarEntry,
} from "@/lib/content-calendar"

type CalendarListViewProps = {
  entries: ContentCalendarEntry[]
  onStatusClick?: (entry: ContentCalendarEntry) => void
  onEdit?: (entry: ContentCalendarEntry) => void
  onDelete?: (entry: ContentCalendarEntry) => void
  onDuplicate?: (entry: ContentCalendarEntry) => void
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
                          className="cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
                          disabled={actionBusyId === entry.id}
                        >
                          Edit
                        </button>
                      )}
                      {onDuplicate && (
                        <button
                          type="button"
                          onClick={() => onDuplicate(entry)}
                          className="cursor-pointer rounded-lg border border-border-brand px-2.5 py-1 text-xs font-semibold text-text-mid hover:border-orange-brand hover:text-orange-brand"
                          disabled={actionBusyId === entry.id}
                        >
                          Duplicate +1mo
                        </button>
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
                    className="cursor-pointer rounded-lg border border-border-brand px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit
                  </button>
                )}
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => onDuplicate(entry)}
                    className="cursor-pointer rounded-lg border border-border-brand px-3 py-1.5 text-xs font-semibold"
                  >
                    Duplicate +1mo
                  </button>
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
