type RecaptchaVerifyResponse = {
  success?: boolean
  score?: number
  action?: string
  "error-codes"?: string[]
}

// Minimum score to treat a request as human. reCAPTCHA v3 returns 0.0–1.0.
const MIN_SCORE = 0.5

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean
  score: number
  error?: string
}> {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  // If the secret is not configured (e.g. local dev), skip verification so the
  // app remains usable — but make the gap loud in the logs.
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY is not set — skipping reCAPTCHA verification")
    return { success: true, score: 1 }
  }

  if (!token?.trim()) {
    return {
      success: false,
      score: 0,
      error: "We couldn't verify you're human. Please try again.",
    }
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    })

    const data = (await response.json()) as RecaptchaVerifyResponse

    if (!data.success || (data.score ?? 0) < MIN_SCORE) {
      return {
        success: false,
        score: data.score ?? 0,
        error: "We couldn't verify you're human. Please try again.",
      }
    }

    return { success: true, score: data.score ?? 1 }
  } catch (error) {
    console.error("reCAPTCHA verification request failed:", error)
    return {
      success: false,
      score: 0,
      error: "We couldn't verify you're human. Please try again.",
    }
  }
}
