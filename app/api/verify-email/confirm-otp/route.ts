import { NextResponse } from "next/server"
import {
  confirmEmailVerification,
  isValidEmail,
  normalizeEmail,
  type EmailVerificationPurpose,
} from "@/lib/email-verification"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import {
  EXPIRED_OTP,
  GENERIC_ERROR,
  INVALID_EMAIL,
  rateLimitMessage,
  wrongOtpMessage,
} from "@/lib/security-messages"

type ConfirmOtpBody = {
  email?: string
  otp_code?: string
  purpose?: EmailVerificationPurpose
  reference_id?: string
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

  let body: ConfirmOtpBody
  try {
    body = (await request.json()) as ConfirmOtpBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = normalizeEmail(body.email ?? "")
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: INVALID_EMAIL }, { status: 400 })
  }

  const otpCode = body.otp_code?.trim() ?? ""
  if (!/^\d{6}$/.test(otpCode)) {
    return NextResponse.json({ error: wrongOtpMessage(4) }, { status: 400 })
  }

  const purpose = body.purpose
  if (!purpose || !VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: "Invalid verification purpose." }, { status: 400 })
  }

  const referenceId = body.reference_id?.trim() || null

  try {
    const result = await confirmEmailVerification({
      email,
      otpCode,
      purpose,
      referenceId,
    })

    if (!result.success) {
      if (result.reason === "expired") {
        return NextResponse.json({ error: EXPIRED_OTP }, { status: 400 })
      }
      if (result.reason === "max_attempts") {
        return NextResponse.json(
          { error: wrongOtpMessage(0) },
          { status: 400 },
        )
      }
      return NextResponse.json(
        { error: wrongOtpMessage(result.attemptsRemaining ?? 0) },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, token: result.token })
  } catch (error) {
    console.error("POST /api/verify-email/confirm-otp error:", error)
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 })
  }
}
