import { Resend } from "resend"
import { buildWelcomeEmail } from "@/lib/emails/newsletter"
import type { NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = `Sauraha Nepal <${process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"}>`

export type TokenActionResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "error" }

type ConfirmRow = Pick<
  NewsletterSubscriber,
  "id" | "email" | "name" | "confirmed" | "unsubscribe_token"
>

/**
 * Sends the one-time welcome email after a subscriber confirms. Best-effort:
 * a delivery failure must never break the confirmation itself.
 */
async function sendWelcomeEmail(subscriber: ConfirmRow) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("Newsletter welcome email skipped: RESEND_API_KEY missing.")
    return
  }
  try {
    const resend = new Resend(apiKey)
    const email = buildWelcomeEmail(subscriber)
    const { error } = await resend.emails.send({
      from: FROM,
      to: subscriber.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })
    if (error) console.error("Newsletter welcome email error:", error)
  } catch (err) {
    console.error("Newsletter welcome email error:", err)
  }
}

/** Confirms a subscriber via their confirm_token (double opt-in). Idempotent. */
export async function confirmSubscriber(token: string): Promise<TokenActionResult> {
  const trimmed = token?.trim()
  if (!trimmed) return { ok: false, reason: "invalid" }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return { ok: false, reason: "error" }
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, name, confirmed, unsubscribe_token")
    .eq("confirm_token", trimmed)
    .maybeSingle<ConfirmRow>()

  if (error) return { ok: false, reason: "error" }
  if (!data) return { ok: false, reason: "invalid" }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      status: "active",
    })
    .eq("id", data.id)

  if (updateError) return { ok: false, reason: "error" }

  // Only welcome on the first confirmation, so re-clicks don't re-send.
  if (!data.confirmed) {
    await sendWelcomeEmail(data)
  }

  return { ok: true, email: data.email }
}

/** Unsubscribes a subscriber via their unsubscribe_token. Idempotent. */
export async function unsubscribeSubscriber(token: string): Promise<TokenActionResult> {
  const trimmed = token?.trim()
  if (!trimmed) return { ok: false, reason: "invalid" }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return { ok: false, reason: "error" }
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("unsubscribe_token", trimmed)
    .maybeSingle<Pick<NewsletterSubscriber, "id" | "email">>()

  if (error) return { ok: false, reason: "error" }
  if (!data) return { ok: false, reason: "invalid" }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", data.id)

  if (updateError) return { ok: false, reason: "error" }
  return { ok: true, email: data.email }
}
