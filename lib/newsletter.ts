export type SubscriberStatus = "active" | "unsubscribed" | "bounced"
export type SubscriberSource = "website" | "admin" | "import"

export type NewsletterSubscriber = {
  id: string
  created_at: string
  email: string
  name: string | null
  status: SubscriberStatus
  source: SubscriberSource
  unsubscribed_at: string | null
  unsubscribe_token: string
  confirmed: boolean
  confirmed_at: string | null
  confirm_token: string
}

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"

export type NewsletterCampaign = {
  id: string
  created_at: string
  updated_at: string
  title: string
  subject: string
  preview_text: string | null
  content_html: string | null
  content_json: string | null
  status: CampaignStatus
  scheduled_at: string | null
  sent_at: string | null
  sent_count: number
  failed_count: number
  open_count: number
  created_by: string
}

/** Public subscriber shape returned to the admin UI (mirrors the row). */
export type AdminSubscriberView = NewsletterSubscriber

/** Character guidance shared between composer UI and validation. */
export const SUBJECT_MAX = 60
export const PREVIEW_TEXT_MAX = 90

/** Resend free tier is 100 emails/day. Warn as the active list approaches it. */
export const RESEND_FREE_TIER_WARNING_THRESHOLD = 90

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value)
}
