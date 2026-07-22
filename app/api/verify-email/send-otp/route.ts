import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  buildOtpEmailHtml,
  buildOtpEmailText,
  checkRecentOtpSend,
  cleanupExpiredVerifications,
  createEmailVerification,
  isValidEmail,
  normalizeEmail,
  type EmailVerificationPurpose,
} from "@/lib/email-verification"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import {
  GENERIC_ERROR,
  INVALID_EMAIL,
  rateLimitMessage,
  RECAPTCHA_FAILED,
  RESEND_COOLDOWN,
} from "@/lib/security-messages"
import { verifyRecaptcha } from "@/lib/verify-recaptcha"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

type SendOtpBody = {
  email?: string
  purpose?: EmailVerificationPurpose
  reference_id?: string
  recaptchaToken?: string
}

const VALID_PURPOSES: EmailVerificationPurpose[] = ["guide_contact", "review_submit"]

export async function POST(request: Request) {
  const limit = rateLimit(request, RATE_LIMITS.EMAIL_VERIFY)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: rateLimitMessage(limit.retryAfter) },
      { status: 429 },
    )
  }

  let body: SendOtpBody
  try {
    body = (await request.json()) as SendOtpBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? "")
  if (!captcha.success) {
    return NextResponse.json({ error: RECAPTCHA_FAILED }, { status: 400 })
  }

  const email = normalizeEmail(body.email ?? "")
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: INVALID_EMAIL }, { status: 400 })
  }

  const purpose = body.purpose
  if (!purpose || !VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: "Invalid verification purpose." }, { status: 400 })
  }

  const referenceId = body.reference_id?.trim() || null
  if (purpose === "guide_contact" && !referenceId) {
    return NextResponse.json({ error: "Guide reference is required." }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 })
  }

  try {
    const recentlySent = await checkRecentOtpSend(email)
    if (recentlySent) {
      return NextResponse.json({ error: RESEND_COOLDOWN }, { status: 429 })
    }

    const { otp } = await createEmailVerification({
      email,
      purpose,
      referenceId,
    })

    void cleanupExpiredVerifications()

    const resend = new Resend(resendKey)
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Sauraha Nepal verification code",
      html: buildOtpEmailHtml(otp, purpose),
      text: buildOtpEmailText(otp, purpose),
    })

    if (emailError) {
      console.error("OTP email send error:", emailError)
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/verify-email/send-otp error:", error)
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 })
  }
}
