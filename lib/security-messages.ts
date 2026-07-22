// User-facing copy for bot-defense / rate-limit responses. Kept in one place so
// the API routes and the client toasts stay consistent.

export function rateLimitMessage(retryAfterSeconds?: number): string {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) {
    return "You're doing that too fast. Please try again in a moment."
  }
  const minutes = Math.ceil(retryAfterSeconds / 60)
  if (retryAfterSeconds < 60) {
    return "You're doing that too fast. Please try again in a moment."
  }
  if (minutes === 1) {
    return "You're doing that too fast. Please try again in a minute."
  }
  return `You're doing that too fast. Please try again in ${minutes} minutes.`
}

export const RECAPTCHA_FAILED = "We couldn't verify you're human. Please try again."

export const GENERIC_ERROR =
  "Something went wrong. Please try again or contact hello@mail.saurahanepal.com"
