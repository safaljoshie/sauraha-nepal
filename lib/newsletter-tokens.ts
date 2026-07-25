import type { NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

export type TokenActionResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "error" }

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
    .select("id, email, confirmed")
    .eq("confirm_token", trimmed)
    .maybeSingle<Pick<NewsletterSubscriber, "id" | "email" | "confirmed">>()

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
