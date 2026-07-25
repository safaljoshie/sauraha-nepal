import { marked } from "marked"
import { Resend } from "resend"
import {
  applyInlineStyles,
  buildEmailHTML,
} from "@/lib/emails/newsletter"
import type { NewsletterCampaign, NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = `Sauraha Nepal <${process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"}>`
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000

const SITE_URL = "https://www.saurahanepal.com"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Renders campaign markdown to inline-styled, email-safe HTML. */
export async function renderCampaignContent(markdownSource: string): Promise<string> {
  const rawHtml = await marked.parse(markdownSource ?? "", { async: true })
  return applyInlineStyles(rawHtml)
}

function unsubscribeHeaders(token: string) {
  // RFC 8058 one-click: mail clients POST to this URL. Point it at the API
  // route (handles POST and returns 200), not the human-facing page.
  return {
    "List-Unsubscribe": `<${SITE_URL}/api/newsletter/unsubscribe?token=${token}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  }
}

/** Sends a single test email for a campaign without changing its status. */
export async function sendTestEmail(
  campaign: Pick<NewsletterCampaign, "subject" | "preview_text" | "content_json" | "content_html">,
  toEmail: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: "Email service is not configured." }

  const markdownSource = campaign.content_json ?? campaign.content_html ?? ""
  const content = await renderCampaignContent(markdownSource)
  const fakeSubscriber: Pick<NewsletterSubscriber, "email" | "name" | "unsubscribe_token"> = {
    email: toEmail,
    name: null,
    unsubscribe_token: "test-preview-token",
  }
  const html = buildEmailHTML(content, campaign, fakeSubscriber)

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `[TEST] ${campaign.subject}`,
    html,
    headers: unsubscribeHeaders(fakeSubscriber.unsubscribe_token),
  })

  if (error) {
    console.error("Newsletter test send error:", error)
    return { ok: false, error: "Failed to send test email." }
  }
  return { ok: true }
}

/**
 * Sends a campaign to all active + confirmed subscribers, batching to respect
 * Resend rate limits. Updates status/counts as it goes. Safe to call from the
 * send route (immediate) and the scheduled processor.
 */
export async function sendCampaign(campaignId: string): Promise<{
  ok: boolean
  sent: number
  failed: number
  error?: string
}> {
  const apiKey = process.env.RESEND_API_KEY
  const supabase = getSupabaseAdmin()

  const { data: campaign, error: campaignError } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single<NewsletterCampaign>()

  if (campaignError || !campaign) {
    return { ok: false, sent: 0, failed: 0, error: "Campaign not found." }
  }

  if (!apiKey) {
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", campaignId)
    return { ok: false, sent: 0, failed: 0, error: "Email service is not configured." }
  }

  // Mark as sending immediately so concurrent processors don't double-send.
  await supabase
    .from("newsletter_campaigns")
    .update({ status: "sending", updated_at: new Date().toISOString() })
    .eq("id", campaignId)

  const { data: subscribers, error: subscribersError } = await supabase
    .from("newsletter_subscribers")
    .select("email, name, unsubscribe_token")
    .eq("status", "active")
    .eq("confirmed", true)

  if (subscribersError) {
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", campaignId)
    return { ok: false, sent: 0, failed: 0, error: "Failed to load subscribers." }
  }

  const recipients = (subscribers ?? []) as Pick<
    NewsletterSubscriber,
    "email" | "name" | "unsubscribe_token"
  >[]

  const markdownSource = campaign.content_json ?? campaign.content_html ?? ""
  const content = await renderCampaignContent(markdownSource)

  const resend = new Resend(apiKey)
  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async (subscriber) => {
        try {
          const html = buildEmailHTML(content, campaign, subscriber)
          const { error } = await resend.emails.send({
            from: FROM,
            to: subscriber.email,
            subject: campaign.subject,
            html,
            headers: unsubscribeHeaders(subscriber.unsubscribe_token),
          })
          return !error
        } catch (err) {
          console.error("Newsletter send error:", subscriber.email, err)
          return false
        }
      }),
    )

    for (const ok of results) {
      if (ok) sent += 1
      else failed += 1
    }

    // Persist progress so the admin can see counts climb.
    await supabase
      .from("newsletter_campaigns")
      .update({ sent_count: sent, failed_count: failed })
      .eq("id", campaignId)

    if (i + BATCH_SIZE < recipients.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  await supabase
    .from("newsletter_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_count: sent,
      failed_count: failed,
    })
    .eq("id", campaignId)

  return { ok: true, sent, failed }
}
