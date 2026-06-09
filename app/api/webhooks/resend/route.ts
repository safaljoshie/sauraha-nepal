import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
  }

  const payload = await request.text()

  let event
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    })
  } catch (error) {
    console.error("Resend webhook verification failed:", error)
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true })
  }

  const forwardTo = process.env.CONTACT_TO_EMAIL ?? "safaljoshie@gmail.com"
  const from = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

  const { error } = await resend.emails.receiving.forward({
    emailId: event.data.email_id,
    to: forwardTo,
    from,
  })

  if (error) {
    console.error("Resend inbound forward error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
