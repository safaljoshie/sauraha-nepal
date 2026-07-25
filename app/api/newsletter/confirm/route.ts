import { NextResponse } from "next/server"
import { confirmSubscriber } from "@/lib/newsletter-tokens"

type ConfirmBody = { token?: string }

export async function POST(request: Request) {
  let body: ConfirmBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const token = body.token?.trim()
  if (!token) {
    return NextResponse.json({ error: "Missing confirmation token." }, { status: 400 })
  }

  const result = await confirmSubscriber(token)
  if (!result.ok) {
    if (result.reason === "invalid") {
      return NextResponse.json(
        { error: "This confirmation link is invalid or has expired." },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
