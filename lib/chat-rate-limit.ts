const MAX_MESSAGES_PER_HOUR = 20
const WINDOW_MS = 60 * 60 * 1000

type WindowState = {
  count: number
  windowStart: number
}

const store = new Map<string, WindowState>()

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown"
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    return { allowed: true }
  }

  if (entry.count >= MAX_MESSAGES_PER_HOUR) {
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - entry.windowStart),
    }
  }

  return { allowed: true }
}

export function recordRateLimitHit(ip: string): void {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now })
    return
  }

  entry.count += 1
  store.set(ip, entry)
}
