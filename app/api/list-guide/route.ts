import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  buildGuideAdminNotificationEmail,
  buildGuideApplicantConfirmationEmail,
} from "@/lib/emails/guide-application"
import { validateListGuidePayload } from "@/lib/list-guide"
import { buildGuideInsertRow } from "@/lib/guide-admin"
import { getSupabaseAdmin } from "@/lib/supabase"
import { enforceRecaptchaAndRateLimit } from "@/lib/api-security"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"
const ADMIN_TO = process.env.CONTACT_TO_EMAIL ?? "safaljoshie@gmail.com"

export async function POST(request: Request) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const blocked = await enforceRecaptchaAndRateLimit(request, "LIST_GUIDE", body)
  if (blocked) return blocked

  const { data, error: validationError } = validateListGuidePayload(body)
  if (!data || validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 },
    )
  }

  const built = buildGuideInsertRow({
    ...data,
    years_experience: data.years_experience ?? undefined,
    status: "pending",
    licence_verified: false,
    is_verified: false,
  })
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 })
  }

  const { data: inserted, error: dbError } = await supabase
    .from("tour_guides")
    .insert(built.row)
    .select("id")
    .single()

  if (dbError || !inserted) {
    console.error("Guide insert error:", dbError)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  const resend = new Resend(resendKey)
  const adminEmail = buildGuideAdminNotificationEmail(data)
  const applicantEmail = buildGuideApplicantConfirmationEmail(data)

  const adminResult = await resend.emails.send({
    from: FROM,
    to: ADMIN_TO,
    replyTo: data.email,
    subject: adminEmail.subject,
    html: adminEmail.html,
    text: adminEmail.text,
  })

  const ownerResult = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: applicantEmail.subject,
    html: applicantEmail.html,
    text: applicantEmail.text,
  })

  if (adminResult.error) {
    console.error("Resend guide admin notification error:", adminResult.error)
  }
  if (ownerResult.error) {
    console.error("Resend guide applicant confirmation error:", ownerResult.error)
  }

  return NextResponse.json({
    success: true,
    id: inserted.id,
    full_name: data.full_name,
    emailWarning: adminResult.error
      ? "Your application was saved. We could not send the notification email — we will still review your submission."
      : ownerResult.error
        ? "Your application was saved. Confirmation email could not be sent — we will still review your submission."
        : undefined,
  })
}
