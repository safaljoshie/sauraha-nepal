import { NextResponse } from "next/server"
import { Resend } from "resend"
import { buildSubscriptionConfirmationEmail } from "@/lib/emails/newsletter"
import { isValidEmail, type NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = `Sauraha Nepal <${process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"}>`

type SubscribeBody = {
  email?: string
  name?: string
}

type ConfirmRow = Pick<
  NewsletterSubscriber,
  "id" | "email" | "name" | "status" | "confirmed" | "confirm_token" | "unsubscribe_token"
>

async function sendConfirmation(subscriber: ConfirmRow) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Signup still succeeds; log so admins know delivery is unconfigured.
    console.error("Newsletter confirmation email skipped: RESEND_API_KEY missing.")
    return
  }
  const resend = new Resend(apiKey)
  const email = buildSubscriptionConfirmationEmail(subscriber)
  const { error } = await resend.emails.send({
    from: FROM,
    to: subscriber.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
  if (error) {
    console.error("Newsletter confirmation email error:", error)
  }
}

export async function POST(request: Request) {
  let body: SubscribeBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const name = body.name?.trim() || null

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json(
      { error: "Newsletter signup is not available right now." },
      { status: 500 },
    )
  }

  const { data: existing, error: lookupError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, name, status, confirmed, confirm_token, unsubscribe_token")
    .eq("email", email)
    .maybeSingle<ConfirmRow>()

  if (lookupError) {
    console.error("Newsletter lookup error:", lookupError)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  // Already fully subscribed.
  if (existing && existing.status === "active" && existing.confirmed) {
    return NextResponse.json({ status: "already_subscribed" })
  }

  // Existing but unconfirmed: resend confirmation.
  if (existing && !existing.confirmed) {
    await supabase
      .from("newsletter_subscribers")
      .update({ name: name ?? existing.name, status: "active", source: "website" })
      .eq("id", existing.id)
    await sendConfirmation({ ...existing, name: name ?? existing.name })
    return NextResponse.json({ status: "pending" })
  }

  // Previously unsubscribed (confirmed=true, status=unsubscribed): re-activate
  // and require re-confirmation to respect the earlier opt-out.
  if (existing && existing.status === "unsubscribed") {
    await supabase
      .from("newsletter_subscribers")
      .update({
        name: name ?? existing.name,
        status: "active",
        confirmed: false,
        confirmed_at: null,
        unsubscribed_at: null,
        source: "website",
      })
      .eq("id", existing.id)
    await sendConfirmation({ ...existing, name: name ?? existing.name })
    return NextResponse.json({ status: "pending" })
  }

  // New subscriber. Insert with confirmed=false; DB defaults generate tokens.
  const { data: inserted, error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, name, status: "active", source: "website", confirmed: false })
    .select("id, email, name, status, confirmed, confirm_token, unsubscribe_token")
    .single<ConfirmRow>()

  if (insertError || !inserted) {
    // Unique violation race: treat as pending (someone just signed up).
    if (insertError?.code === "23505") {
      return NextResponse.json({ status: "pending" })
    }
    console.error("Newsletter subscribe error:", insertError)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }

  await sendConfirmation(inserted)
  return NextResponse.json({ status: "pending" })
}
