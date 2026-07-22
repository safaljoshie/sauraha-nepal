import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { buildChatSystemPrompt, buildListingsContext } from "@/lib/chat-listings-context"
import { CHAT_RECAPTCHA_SESSION_KEY } from "@/lib/email-verification"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { rateLimitMessage, RECAPTCHA_FAILED } from "@/lib/security-messages"
import type { ChatApiRequestBody } from "@/lib/chat-types"
import { validateChatHistory, validateChatMessage } from "@/lib/chat-validate"
import { verifyRecaptcha } from "@/lib/verify-recaptcha"
import { getSupabaseAdmin } from "@/lib/supabase"

const MODEL = "claude-haiku-4-5-20251001"
const MAX_TOKENS = 500

function logChatToSupabase(
  message: string,
  response: string,
  sessionId: string | undefined,
) {
  try {
    const supabase = getSupabaseAdmin()
    void supabase
      .from("chat_logs")
      .insert({
        message,
        response,
        session_id: sessionId?.trim() || null,
      })
      .then(({ error }) => {
        if (error) console.error("chat_logs insert:", error.message)
      })
  } catch (err) {
    console.error("chat_logs insert skipped:", err)
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Dhurbe is not configured." },
      { status: 500 },
    )
  }

  const limit = rateLimit(request, RATE_LIMITS.CHAT)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: rateLimitMessage(limit.retryAfter),
        reply:
          "You've sent too many messages. Please wait a few minutes before trying again.",
      },
      { status: 429 },
    )
  }

  let body: ChatApiRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const history = validateChatHistory(body.history)
  const isFirstMessage = history.length === 0

  if (isFirstMessage) {
    const captcha = await verifyRecaptcha(body.recaptchaToken ?? "")
    if (!captcha.success) {
      return NextResponse.json({ error: RECAPTCHA_FAILED }, { status: 400 })
    }
  }

  const message = validateChatMessage(body.message)
  if (!message) {
    return NextResponse.json({ error: "Message is required (max 200 characters)." }, { status: 400 })
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : undefined

  try {
    const listingsContext = await buildListingsContext()
    const system = buildChatSystemPrompt(listingsContext)

    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [...history, { role: "user", content: message }],
    })

    const block = response.content[0]
    const reply =
      block?.type === "text"
        ? block.text
        : "Sorry, I could not process that."

    logChatToSupabase(message, reply, sessionId)

    return NextResponse.json({
      reply,
      recaptchaVerified: isFirstMessage ? true : undefined,
      recaptchaSessionKey: isFirstMessage ? CHAT_RECAPTCHA_SESSION_KEY : undefined,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error:
          "Sorry, I'm having trouble connecting. Please try again or email us at hello@mail.saurahanepal.com",
      },
      { status: 500 },
    )
  }
}
