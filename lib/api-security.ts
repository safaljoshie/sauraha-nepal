import { NextResponse } from "next/server"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { rateLimitMessage, RECAPTCHA_FAILED } from "@/lib/security-messages"
import { verifyRecaptcha } from "@/lib/verify-recaptcha"

type SecuredBody = {
  recaptchaToken?: string
}

export async function enforceRecaptchaAndRateLimit(
  request: Request,
  rateLimitConfig: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS],
  body: SecuredBody,
): Promise<NextResponse | null> {
  const limit = rateLimit(request, rateLimitConfig)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: rateLimitMessage(limit.retryAfter) },
      { status: 429 },
    )
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? "")
  if (!captcha.success) {
    return NextResponse.json({ error: RECAPTCHA_FAILED }, { status: 400 })
  }

  return null
}
