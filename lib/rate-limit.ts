import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { getClientIp } from "@/lib/chat-rate-limit"

// Durable, cross-instance rate limiting backed by Upstash Redis. Unlike the
// in-memory limiter in lib/chat-rate-limit.ts, this survives serverless cold
// starts and is shared across all Vercel instances.

type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`

type RateLimitConfig = {
  tokens: number
  window: Duration
}

export const RATE_LIMITS = {
  LIST_BUSINESS: { tokens: 3, window: "1 h" },
  LIST_GUIDE: { tokens: 3, window: "1 h" },
  REVIEW_SUBMIT: { tokens: 5, window: "1 h" },
  ACCOUNT_MUTATION: { tokens: 10, window: "1 h" },
} satisfies Record<string, RateLimitConfig>

export type RateLimitId = keyof typeof RATE_LIMITS

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfter?: number // seconds
}

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = url && token ? new Redis({ url, token }) : null

const limiters = new Map<RateLimitId, Ratelimit>()

function getLimiter(id: RateLimitId): Ratelimit | null {
  if (!redis) return null
  const existing = limiters.get(id)
  if (existing) return existing

  const config = RATE_LIMITS[id]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.tokens, config.window),
    prefix: `rl:${id}`,
    analytics: false,
  })
  limiters.set(id, limiter)
  return limiter
}

export async function rateLimit(request: Request, id: RateLimitId): Promise<RateLimitResult> {
  const limiter = getLimiter(id)

  // Fail open when Upstash is not configured (e.g. local dev) so the app stays
  // usable, but leave a warning so the gap is visible.
  if (!limiter) {
    if (!redis) {
      console.warn(`Upstash not configured — skipping rate limit for "${id}"`)
    }
    return { allowed: true, remaining: Number.POSITIVE_INFINITY }
  }

  const ip = getClientIp(request)
  try {
    const { success, remaining, reset } = await limiter.limit(ip)
    return {
      allowed: success,
      remaining,
      retryAfter: success ? undefined : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    }
  } catch (error) {
    // Never let a Redis hiccup take down a submission — fail open.
    console.error(`Rate limit check failed for "${id}":`, error)
    return { allowed: true, remaining: Number.POSITIVE_INFINITY }
  }
}
