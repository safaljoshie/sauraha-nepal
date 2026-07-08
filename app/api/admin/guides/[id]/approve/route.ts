import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  buildGuideApprovalEmail,
} from "@/lib/emails/guide-application"
import { hasGuideContactEmail } from "@/lib/list-guide"
import {
  buildGuideProfilePath,
  fetchGuideByIdAdmin,
  normalizeTourGuide,
} from "@/lib/tour-guides"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const existing = await fetchGuideByIdAdmin(id)
    if (!existing) {
      return NextResponse.json({ error: "Guide not found." }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    const { data: updated, error: updateError } = await supabase
      .from("tour_guides")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError || !updated) {
      console.error("Approve guide error:", updateError)
      return NextResponse.json({ error: "Failed to approve guide." }, { status: 500 })
    }

    const guide = normalizeTourGuide(updated)
    revalidatePath("/guides")
    revalidatePath(buildGuideProfilePath(guide))

    if (!hasGuideContactEmail(guide.email)) {
      return NextResponse.json({ success: true, guide, emailSkipped: true })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ success: true, guide, emailSkipped: true })
    }

    const email = buildGuideApprovalEmail(guide)
    const resend = new Resend(resendKey)
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: guide.email!.trim(),
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (emailError) {
      console.error("Resend guide approval email error:", emailError)
      return NextResponse.json({ success: true, guide, emailSkipped: true })
    }

    return NextResponse.json({ success: true, guide })
  } catch (error) {
    console.error("POST /api/admin/guides/[id]/approve error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
