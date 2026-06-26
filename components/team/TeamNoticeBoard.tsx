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
      <section className="mb-4 rounded-2xl border border-border-brand bg-white p-3 shadow-sm sm:mb-6 sm:p-5">
        <p className="team-notice-message text-text-light">Loading notice board…</p>
      </section>
    )
  }

  if (notices.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Team notice board"
      className="mb-4 overflow-hidden rounded-2xl border border-green-brand/25 bg-white shadow-[0_8px_32px_rgba(26,92,42,0.08)] sm:mb-6"
    >
      <div className="border-b border-green-brand/15 bg-green-brand px-3 py-2 sm:px-5 sm:py-3">
        <h2 className="team-notice-heading flex items-center gap-1.5 sm:gap-2">
          <span aria-hidden className="text-[0.9em]">
            📌
          </span>
          Notice board
        </h2>
        <p className="team-notice-subheading mt-0.5">Updates and reminders from the content team</p>
      </div>

      <ul className="divide-y divide-border-brand/70">
        {notices.map((notice) => (
          <li
            key={notice.id}
            className={`px-3 py-2.5 sm:px-5 sm:py-3.5 ${notice.is_pinned ? "bg-orange-brand/5" : "bg-cream/30"}`}
          >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {notice.is_pinned && (
                    <span className="team-notice-pin rounded-full bg-orange-brand/15 px-1.5 py-0.5 text-orange-brand sm:px-2">
                      Pinned
                    </span>
                  )}
                  <h3 className="team-notice-item-title">{notice.title}</h3>
                </div>
                <p className="team-notice-message mt-1 whitespace-pre-wrap sm:mt-1.5">
                  {notice.message}
                </p>
                {notice.link && (
                  <a
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-notice-message mt-1 inline-flex font-semibold text-green-brand hover:underline sm:mt-1.5"
                  >
                    Open link →
                  </a>
                )}
              </div>
              <p className="team-notice-date shrink-0">
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
