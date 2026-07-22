import { getSupabaseAdmin } from "@/lib/supabase"

export type EmailVerificationPurpose = "guide_contact" | "review_submit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase())
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateVerificationToken(): string {
  return crypto.randomUUID()
}

export async function cleanupExpiredVerifications(): Promise<void> {
  const supabase = getSupabaseAdmin()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from("email_verifications")
    .delete()
    .lt("expires_at", cutoff)

  if (error) {
    console.error("email_verifications cleanup error:", error)
  }
}

export async function checkRecentOtpSend(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const since = new Date(Date.now() - RESEND_COOLDOWN_MS).toISOString()
  const { data, error } = await supabase
    .from("email_verifications")
    .select("id")
    .eq("email", email)
    .gte("created_at", since)
    .limit(1)

  if (error) {
    console.error("checkRecentOtpSend error:", error)
    return false
  }

  return (data?.length ?? 0) > 0
}

export async function createEmailVerification(params: {
  email: string
  purpose: EmailVerificationPurpose
  referenceId?: string | null
}): Promise<{ otp: string; expiresAt: string }> {
  const supabase = getSupabaseAdmin()
  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabase.from("email_verifications").insert({
    email: params.email,
    otp_code: otp,
    purpose: params.purpose,
    reference_id: params.referenceId ?? null,
    expires_at: expiresAt,
    verified: false,
    attempts: 0,
  })

  if (error) {
    throw error
  }

  return { otp, expiresAt }
}

export async function confirmEmailVerification(params: {
  email: string
  otpCode: string
  purpose: EmailVerificationPurpose
  referenceId?: string | null
}): Promise<
  | { success: true; token: string }
  | { success: false; reason: "not_found" | "expired" | "max_attempts"; attemptsRemaining?: number }
> {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  let query = supabase
    .from("email_verifications")
    .select("*")
    .eq("email", params.email)
    .eq("purpose", params.purpose)
    .eq("verified", false)
    .gte("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)

  if (params.referenceId) {
    query = query.eq("reference_id", params.referenceId)
  }

  const { data: rows, error } = await query

  if (error) {
    console.error("confirmEmailVerification lookup error:", error)
    return { success: false, reason: "not_found" }
  }

  const row = rows?.[0]
  if (!row) {
    return { success: false, reason: "expired" }
  }

  if (row.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, reason: "max_attempts" }
  }

  if (row.otp_code !== params.otpCode) {
    const newAttempts = (row.attempts ?? 0) + 1
    await supabase
      .from("email_verifications")
      .update({ attempts: newAttempts })
      .eq("id", row.id)

    if (newAttempts >= MAX_OTP_ATTEMPTS) {
      return { success: false, reason: "max_attempts" }
    }

    return {
      success: false,
      reason: "not_found",
      attemptsRemaining: MAX_OTP_ATTEMPTS - newAttempts,
    }
  }

  const token = generateVerificationToken()
  const { error: updateError } = await supabase
    .from("email_verifications")
    .update({ verified: true, attempts: row.attempts ?? 0 })
    .eq("id", row.id)

  if (updateError) {
    console.error("confirmEmailVerification update error:", updateError)
    return { success: false, reason: "not_found" }
  }

  return { success: true, token }
}

export function buildOtpEmailHtml(otp: string, purpose: EmailVerificationPurpose): string {
  const contextLine =
    purpose === "guide_contact"
      ? "You requested this to view a tour guide's contact details on saurahanepal.com."
      : "You requested this to submit a review on saurahanepal.com."

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4dc;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5c2a 0%,#0d3a18 100%);padding:24px 28px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Sauraha Nepal</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">Your verification code is:</p>
            <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.2em;color:#1a5c2a;text-align:center;">${otp}</p>
            <p style="margin:0 0 12px;font-size:14px;color:#666;line-height:1.6;">This code expires in 10 minutes.</p>
            <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">${contextLine} If this wasn't you, ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

export function buildOtpEmailText(otp: string, purpose: EmailVerificationPurpose): string {
  const contextLine =
    purpose === "guide_contact"
      ? "You requested this to view a tour guide's contact details on saurahanepal.com."
      : "You requested this to submit a review on saurahanepal.com."

  return [
    `Your verification code is: ${otp}`,
    "",
    "This code expires in 10 minutes.",
    "",
    contextLine,
    "If this wasn't you, ignore this email.",
  ].join("\n")
}

export function guideContactSessionKey(guideId: string): string {
  return `guide_contact_verified_${guideId}`
}

export function reviewEmailSessionKey(referenceId: string): string {
  return `review_email_verified_${referenceId}`
}

export const CHAT_RECAPTCHA_SESSION_KEY = "chat_recaptcha_verified"
