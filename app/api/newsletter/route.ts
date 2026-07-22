import { NextResponse } from "next/server"
import { enforceRecaptchaAndRateLimit } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { getSupabaseAdmin } from "@/lib/supabase"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type NewsletterBody = {
  email?: string
  recaptchaToken?: string
}

export async function POST(request: Request) {
  let body: NewsletterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const securityError = await enforceRecaptchaAndRateLimit(
    request,
    RATE_LIMITS.NEWSLETTER,
    body,
  )
  if (securityError) return securityError

  const email = body.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json(
      { error: "Newsletter signup is not available right now." },
      { status: 500 },
    )
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({ email })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true })
    }

    console.error("Newsletter subscribe error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
