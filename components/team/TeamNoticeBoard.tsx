"use client"

import { formatNoticeDate, type TeamNotice } from "@/lib/team-notices"

export default function TeamNoticeBoard({
  notices,
  loading,
}: {
  notices: TeamNotice[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <section className="mb-6 rounded-2xl border border-border-brand bg-white p-5 shadow-sm">
        <p className="text-sm text-text-light">Loading notice board…</p>
      </section>
    )
  }

  if (notices.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Team notice board"
      className="mb-6 overflow-hidden rounded-2xl border border-green-brand/25 bg-white shadow-[0_8px_32px_rgba(26,92,42,0.08)]"
    >
      <div className="border-b border-green-brand/15 bg-green-brand px-5 py-3">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-lg font-bold text-white">
          <span aria-hidden>📌</span>
          Notice board
        </h2>
        <p className="mt-0.5 text-xs text-white/80">
          Updates and reminders from the content team
        </p>
      </div>

      <ul className="divide-y divide-border-brand/70">
        {notices.map((notice) => (
          <li
            key={notice.id}
            className={`px-5 py-4 ${notice.is_pinned ? "bg-orange-brand/5" : "bg-cream/30"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {notice.is_pinned && (
                    <span className="rounded-full bg-orange-brand/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-orange-brand">
                      Pinned
                    </span>
                  )}
                  <h3 className="font-semibold text-text-brand">{notice.title}</h3>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-mid">
                  {notice.message}
                </p>
                {notice.link && (
                  <a
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-sm font-semibold text-green-brand hover:underline"
                  >
                    Open link →
                  </a>
                )}
              </div>
              <p className="shrink-0 text-xs text-text-light">
                {formatNoticeDate(notice.created_at)}
                {notice.expires_at && (
                  <>
                    <br />
                    Until {formatNoticeDate(notice.expires_at)}
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
