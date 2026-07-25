import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { isValidEmail, type NewsletterSubscriber } from "@/lib/newsletter"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Newsletter subscribers fetch error:", error)
      return NextResponse.json({ error: "Failed to load subscribers." }, { status: 500 })
    }

    return NextResponse.json({ subscribers: (data ?? []) as NewsletterSubscriber[] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

type AddBody = {
  email?: string
  name?: string
  skipConfirmation?: boolean
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: AddBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const name = body.name?.trim() || null
  const skipConfirmation = body.skipConfirmation !== false

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        name,
        source: "admin",
        status: "active",
        confirmed: skipConfirmation,
        confirmed_at: skipConfirmation ? now : null,
      })
      .select("*")
      .single<NewsletterSubscriber>()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 })
      }
      console.error("Newsletter add subscriber error:", error)
      return NextResponse.json({ error: "Failed to add subscriber." }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriber: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
