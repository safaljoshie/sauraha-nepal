import { NextResponse } from "next/server"
import { Resend } from "resend"

const FROM =
  process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"
const TO = process.env.CONTACT_TO_EMAIL ?? "safaljoshie@gmail.com"

type ContactBody = {
  name?: string
  email?: string
  message?: string
  business?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    )
  }

  let body: ContactBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim()
  const message = body.message?.trim()
  const business = body.business?.trim() ?? ""

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const subject = business
    ? `Sauraha Nepal — ${business}`
    : `Sauraha Nepal — message from ${name}`

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${business ? `<p><strong>Business / subject:</strong> ${escapeHtml(business)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject,
    html,
    text: [
      "New contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      business ? `Business / subject: ${business}` : null,
      "",
      "Message:",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  })

  if (error) {
    console.error("Resend error:", error)
    return NextResponse.json(
      { error: "Failed to send your message. Please try again later." },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
