export function rateLimitMessage(retryAfterSeconds?: number): string {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) {
    return "Too many attempts. Please try again later."
  }
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60))
  if (minutes === 1) {
    return "Too many attempts. Please try again in 1 minute."
  }
  return `Too many attempts. Please try again in ${minutes} minutes.`
}

export const RECAPTCHA_FAILED = "We couldn't verify you're human. Please try again."

export const INVALID_EMAIL = "Please enter a valid email address."

export const GENERIC_ERROR =
  "Something went wrong. Please try again or contact hello@mail.saurahanepal.com"

export function wrongOtpMessage(attemptsRemaining: number): string {
  if (attemptsRemaining <= 0) {
    return "Too many incorrect attempts. Please request a new code."
  }
  return `Incorrect code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
}

export const EXPIRED_OTP = "This code has expired. Please request a new one."

export const RESEND_COOLDOWN = "Please wait before requesting another code."
