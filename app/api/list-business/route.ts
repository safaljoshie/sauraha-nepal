import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  buildAdminNotificationEmail,
  buildOwnerConfirmationEmail,
} from "@/lib/emails/list-business"
import {
  type ListBusinessPayload,
  validateListBusinessPayload,
} from "@/lib/list-business"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM =
  process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"
const ADMIN_TO = process.env.CONTACT_TO_EMAIL ?? "safaljoshie@gmail.com"

export async function POST(request: Request) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    )
  }

  let body: Partial<ListBusinessPayload>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { data, error: validationError } = validateListBusinessPayload(body)
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

  const { error: dbError } = await supabase.from("business_listings").insert({
    business_name: data.business_name,
    category: data.category,
    description: data.description,
    price_range: data.price_range || null,
    opening_hours: data.opening_hours || null,
    owner_name: data.owner_name,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp || null,
    website: data.website || null,
    facebook: data.facebook || null,
    address: data.address,
    google_maps_link: data.google_maps_link || null,
    photo_links: data.photo_links || null,
    plan: data.plan,
    status: data.status,
    agreed_to_terms: data.agreed_to_terms,
  })

  if (dbError) {
    console.error("Supabase insert error:", dbError)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  const resend = new Resend(resendKey)
  const adminEmail = buildAdminNotificationEmail(data)
  const ownerEmail = buildOwnerConfirmationEmail(data)

  const [adminResult, ownerResult] = await Promise.all([
    resend.emails.send({
      from: FROM,
      to: ADMIN_TO,
      replyTo: data.email,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    }),
    resend.emails.send({
      from: FROM,
      to: data.email,
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      text: ownerEmail.text,
    }),
  ])

  if (adminResult.error) {
    console.error("Resend admin notification error:", adminResult.error)
  }
  if (ownerResult.error) {
    console.error("Resend owner confirmation error:", ownerResult.error)
  }

  return NextResponse.json({
    success: true,
    plan: data.plan,
    owner_name: data.owner_name,
    emailWarning:
      adminResult.error || ownerResult.error
        ? "Your listing was saved. Confirmation email could not be sent — we will still review your submission."
        : undefined,
  })
}
