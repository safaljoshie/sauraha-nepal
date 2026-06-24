export type TeamNotice = {
  id: string
  created_at: string
  updated_at: string
  title: string
  message: string
  link: string | null
  is_pinned: boolean
  is_active: boolean
  expires_at: string | null
}

export type TeamNoticePayload = {
  title: string
  message: string
  link?: string | null
  is_pinned?: boolean
  is_active?: boolean
  expires_at?: string | null
}

export function formatNoticeDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function normalizeNoticePayload(body: Partial<TeamNoticePayload>) {
  const title = body.title?.trim() ?? ""
  const message = body.message?.trim() ?? ""
  const link = body.link?.trim() || null
  const is_pinned = Boolean(body.is_pinned)
  const is_active = body.is_active !== false
  const expires_at = body.expires_at?.trim() || null

  if (!title || !message) {
    return { error: "Title and message are required." as const }
  }

  return {
    data: { title, message, link, is_pinned, is_active, expires_at },
  }
}

export function isNoticeVisible(notice: TeamNotice, today = new Date()) {
  if (!notice.is_active) return false
  if (!notice.expires_at) return true
  const expiry = new Date(`${notice.expires_at}T23:59:59`)
  return expiry >= today
}

export function sortNotices(notices: TeamNotice[]) {
  return [...notices].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
