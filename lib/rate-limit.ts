interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  identifier?: string
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown"
}

export function rateLimit(
  req: Request,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const ip = getClientIp(req)
  const key = `${config.identifier || "default"}:${ip}`
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
  }
}

export const RATE_LIMITS = {
  CONTACT_FORM: { maxRequests: 5, windowMs: 60 * 60 * 1000, identifier: "contact" },
  LIST_BUSINESS: { maxRequests: 3, windowMs: 60 * 60 * 1000, identifier: "list-business" },
  LIST_GUIDE: { maxRequests: 3, windowMs: 60 * 60 * 1000, identifier: "list-guide" },
  REVIEW_SUBMIT: { maxRequests: 5, windowMs: 60 * 60 * 1000, identifier: "review" },
  GUIDE_REVIEW: { maxRequests: 5, windowMs: 60 * 60 * 1000, identifier: "guide-review" },
  EMAIL_VERIFY: { maxRequests: 3, windowMs: 60 * 60 * 1000, identifier: "email-verify" },
  CHAT: { maxRequests: 20, windowMs: 60 * 60 * 1000, identifier: "chat" },
  GUIDE_CONTACT: { maxRequests: 10, windowMs: 60 * 60 * 1000, identifier: "guide-contact" },
  NEWSLETTER: { maxRequests: 5, windowMs: 60 * 60 * 1000, identifier: "newsletter" },
}

export { getClientIp }
