import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { isValidEmail } from "@/lib/newsletter"
import { sendTestEmail } from "@/lib/newsletter-send"

type TestBody = {
  toEmail?: string
  subject?: string
  preview_text?: string
  content?: string
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: TestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const toEmail = body.toEmail?.trim().toLowerCase()
  const subject = body.subject?.trim()
  if (!toEmail || !isValidEmail(toEmail)) {
    return NextResponse.json({ error: "Please enter a valid test email address." }, { status: 400 })
  }
  if (!subject) {
    return NextResponse.json({ error: "Add a subject line before sending a test." }, { status: 400 })
  }

  const result = await sendTestEmail(
    {
      subject,
      preview_text: body.preview_text?.trim() || null,
      content_json: body.content ?? "",
      content_html: null,
    },
    toEmail,
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to send test email." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
