import { NextResponse } from "next/server"
import { Resend } from "resend"
import { buildBusinessReviewNotificationEmail } from "@/lib/emails/business-review"
import { getSupabaseAdmin } from "@/lib/supabase"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"
import { enforceRecaptchaAndRateLimit } from "@/lib/api-security"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"
const ADMIN_EMAIL = process.env.CONTACT_TO_EMAIL ?? "safaljoshie@gmail.com"

type ReviewPayload = {
  business_id?: string
  rating?: number
  comment?: string
  visit_date?: string
  recaptchaToken?: string
}

export async function POST(request: Request) {
  let payload: ReviewPayload
  try {
    payload = (await request.json()) as ReviewPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const blocked = await enforceRecaptchaAndRateLimit(request, "REVIEW_SUBMIT", payload)
  if (blocked) return blocked

  const auth = await createSupabaseServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 })
  }

  const businessId = payload.business_id?.trim() ?? ""
  const comment = payload.comment?.trim() ?? ""
  const rating = Number(payload.rating)

  if (!businessId) {
    return NextResponse.json({ error: "Business is required." }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please select a rating from 1 to 5." }, { status: 400 })
  }
  if (comment.length < 20) {
    return NextResponse.json(
      { error: "Please write at least 20 characters in your review." },
      { status: 400 },
    )
  }

  const { data: profile } = await auth
    .from("profiles")
    .select("display_name, country")
    .eq("id", user.id)
    .maybeSingle()
  const reviewerName =
    (profile?.display_name as string) ||
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email ||
    "Traveller"
  const reviewerCountry = (profile?.country as string) || null

  try {
    const supabase = getSupabaseAdmin()

    const { data: business } = await supabase
      .from("business_listings")
      .select("id, business_name, status")
      .eq("id", businessId)
      .maybeSingle()
    if (!business || business.status !== "approved") {
      return NextResponse.json({ error: "Business not found." }, { status: 404 })
    }

    const insertRow = {
      business_id: businessId,
      user_id: user.id,
      reviewer_name: reviewerName,
      reviewer_email: user.email ?? null,
      reviewer_country: reviewerCountry,
      rating,
      comment,
      visit_date: payload.visit_date?.trim() || null,
      status: "pending",
    }

    const { data, error } = await supabase
      .from("business_reviews")
      .insert(insertRow)
      .select("*")
      .single()

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "You've already reviewed this business." },
        { status: 409 },
      )
    }
    if (error || !data) {
      console.error("Business review insert error:", error)
      return NextResponse.json({ error: "Could not submit review." }, { status: 500 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const email = buildBusinessReviewNotificationEmail(
        { id: business.id as string, business_name: business.business_name as string },
        { reviewer_name: reviewerName, reviewer_country: reviewerCountry, rating, comment, visit_date: insertRow.visit_date },
      )
      const resend = new Resend(resendKey)
      const { error: emailError } = await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
      if (emailError) console.error("Business review notification email error:", emailError)
    }

    return NextResponse.json({ success: true, review: data })
  } catch (error) {
    console.error("POST /api/business-reviews/submit error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
