import { NextResponse } from "next/server"
import { rateLimit, type RateLimitId } from "@/lib/rate-limit"
import { rateLimitMessage, RECAPTCHA_FAILED } from "@/lib/security-messages"
import { verifyRecaptcha } from "@/lib/verify-recaptcha"

type SecuredBody = {
  recaptchaToken?: string
}

/**
 * Shared bot-defense gate for public mutation routes: durable rate limit first,
 * then reCAPTCHA v3. Returns a ready-to-send NextResponse when the request
 * should be rejected, or `null` when the caller may proceed.
 */
export async function enforceRecaptchaAndRateLimit(
  request: Request,
  rateLimitId: RateLimitId,
  body: SecuredBody,
): Promise<NextResponse | null> {
  const limit = await rateLimit(request, rateLimitId)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: rateLimitMessage(limit.retryAfter), retryAfter: limit.retryAfter },
      { status: 429 },
    )
  }

  const captcha = await verifyRecaptcha(body.recaptchaToken ?? "")
  if (!captcha.success) {
    return NextResponse.json({ error: RECAPTCHA_FAILED }, { status: 400 })
  }

  return null
}
