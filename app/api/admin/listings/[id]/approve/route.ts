import { NextResponse } from "next/server"
import { Resend } from "resend"
import { requireAdminApi } from "@/lib/admin-auth"
import { hasListingContactEmail, type BusinessListing } from "@/lib/business-listing"
import { buildApprovalEmail } from "@/lib/emails/listing-status"
import { revalidateListingPaths } from "@/lib/listing-revalidate"
import { generateUniqueListingSlug } from "@/lib/listing-slug"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM =
  process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

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

    const existing = listing as BusinessListing
    const slug =
      existing.slug?.trim() ||
      (await generateUniqueListingSlug(supabase, existing.business_name, existing.id))

    const { data: updated, error: updateError } = await supabase
      .from("business_listings")
      .update({ status: "approved", slug })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError || !updated) {
      console.error("Supabase update error:", updateError)
      return NextResponse.json(
        { error: "Failed to approve listing." },
        { status: 500 },
      )
    }

    const record = updated as BusinessListing

    // Publish before emailing — a Resend failure must not leave the listing
    // approved in the database but invisible on the site.
    revalidateListingPaths(record)

    if (!hasListingContactEmail(record.email)) {
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    const email = buildApprovalEmail(record)
    const resend = new Resend(resendKey)
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: record.email.trim(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (emailError) {
      console.error("Resend approval email error:", emailError)
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    return NextResponse.json({ success: true, listing: record })
  } catch {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 },
    )
  }
}
