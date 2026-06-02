import { NextResponse } from "next/server"
import { Resend } from "resend"
import { requireAdminApi } from "@/lib/admin-auth"
import type { BusinessListing } from "@/lib/business-listing"
import { buildRejectionEmail } from "@/lib/emails/listing-status"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM =
  process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    )
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: listing, error: fetchError } = await supabase
      .from("business_listings")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 })
    }

    const { data: updated, error: updateError } = await supabase
      .from("business_listings")
      .update({ status: "rejected" })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError || !updated) {
      console.error("Supabase update error:", updateError)
      return NextResponse.json(
        { error: "Failed to reject listing." },
        { status: 500 },
      )
    }

    const record = updated as BusinessListing
    const email = buildRejectionEmail(record)
    const resend = new Resend(resendKey)
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: record.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (emailError) {
      console.error("Resend error:", emailError)
      return NextResponse.json(
        { error: "Listing rejected but email could not be sent." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, listing: record })
  } catch {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 },
    )
  }
}
