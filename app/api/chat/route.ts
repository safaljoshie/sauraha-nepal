import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { buildChatSystemPrompt, buildListingsContext } from "@/lib/chat-listings-context"
import {
  checkRateLimit,
  getClientIp,
  recordRateLimitHit,
} from "@/lib/chat-rate-limit"
import type { ChatApiRequestBody } from "@/lib/chat-types"
import { validateChatHistory, validateChatMessage } from "@/lib/chat-validate"
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
      { error: "Chat assistant is not configured." },
      { status: 500 },
    )
  }

  const ip = getClientIp(request)
  const limit = checkRateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "You've sent too many messages. Please try again in an hour.",
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

  const message = validateChatMessage(body.message)
  if (!message) {
    return NextResponse.json({ error: "Message is required (max 200 characters)." }, { status: 400 })
  }

  const history = validateChatHistory(body.history)
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : undefined

  recordRateLimitHit(ip)

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

    return NextResponse.json({ reply })
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
