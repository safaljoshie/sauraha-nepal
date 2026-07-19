import { NextResponse } from "next/server"
import { Resend } from "resend"
import { requireAdminApi } from "@/lib/admin-auth"
import { hasListingContactEmail, type BusinessListing } from "@/lib/business-listing"
import { buildDeletionEmail } from "@/lib/emails/listing-status"
import { revalidateListingPaths } from "@/lib/listing-revalidate"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

type DeletePayload = {
  id?: string
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: DeletePayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = payload.id?.trim()
  if (!id) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 })
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

    const { error: deleteError } = await supabase
      .from("business_listings")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Supabase delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete listing." }, { status: 500 })
    }

    const record = listing as BusinessListing

    // Remove from the site before emailing — a Resend failure must not leave a
    // deleted listing still reachable.
    revalidateListingPaths(record)

    if (!hasListingContactEmail(record.email)) {
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    const email = buildDeletionEmail(record)
    const resend = new Resend(resendKey)
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: record.email.trim(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (emailError) {
      console.error("Resend delete email error:", emailError)
    }

    return NextResponse.json({ success: true, listing: record })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
