import { NextResponse } from "next/server"
import { unsubscribeSubscriber } from "@/lib/newsletter-tokens"

// RFC 8058 one-click unsubscribe: mail clients POST here with the token in the
// query string. We also accept GET for convenience/testing.
async function handle(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")?.trim()
  if (!token) {
    return NextResponse.json({ error: "Missing unsubscribe token." }, { status: 400 })
  }

  const result = await unsubscribeSubscriber(token)
  if (!result.ok && result.reason === "error") {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  // Always return 200 for one-click so mail clients treat it as success even
  // if the token was already used.
  return NextResponse.json({ success: true })
}

export async function POST(request: Request) {
  return handle(request)
}

export async function GET(request: Request) {
  return handle(request)
}
