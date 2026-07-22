type RecaptchaVerifyResponse = {
  success?: boolean
  score?: number
  "error-codes"?: string[]
}

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean
  score: number
  error?: string
}> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not configured")
    return {
      success: false,
      score: 0,
      error: "We couldn't verify you're human. Please try again.",
    }
  }

  if (!token?.trim()) {
    return {
      success: false,
      score: 0,
      error: "We couldn't verify you're human. Please try again.",
    }
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  })

  const data = (await response.json()) as RecaptchaVerifyResponse

  if (!data.success || (data.score ?? 0) < 0.5) {
    return {
      success: false,
      score: data.score ?? 0,
      error: "We couldn't verify you're human. Please try again.",
    }
  }

  return { success: true, score: data.score ?? 1 }
}
