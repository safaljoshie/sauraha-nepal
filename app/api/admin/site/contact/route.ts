import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { ContactPageContent } from "@/lib/site-content"
import { getSupabaseAdmin } from "@/lib/supabase"

type ContactPayload = {
  heading?: string
  subheading?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  response_time?: string
}

function normalizeOptional(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("contact_page_content")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Contact content fetch error:", error)
      return NextResponse.json({ error: "Failed to load contact content." }, { status: 500 })
    }

    return NextResponse.json({ content: (data ?? null) as ContactPageContent | null })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: ContactPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const heading = payload.heading?.trim() ?? ""
  const phone = normalizeOptional(payload.phone)
  const whatsapp = normalizeOptional(payload.whatsapp)
  const email = normalizeOptional(payload.email)

  if (!heading) {
    return NextResponse.json({ error: "Heading is required." }, { status: 400 })
  }
  if (!phone && !whatsapp && !email) {
    return NextResponse.json(
      { error: "Please provide at least one contact method (phone, WhatsApp, or email)." },
      { status: 400 },
    )
  }

  const update = {
    heading,
    subheading: normalizeOptional(payload.subheading),
    address: normalizeOptional(payload.address),
    phone,
    whatsapp,
    email,
    response_time: normalizeOptional(payload.response_time),
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: existing, error: existingError } = await supabase
      .from("contact_page_content")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error("Contact content existing fetch error:", existingError)
      return NextResponse.json({ error: "Failed to save contact content." }, { status: 500 })
    }

    const result = existing?.id
      ? await supabase
          .from("contact_page_content")
          .update(update)
          .eq("id", existing.id)
          .select("*")
          .single()
      : await supabase.from("contact_page_content").insert(update).select("*").single()

    if (result.error || !result.data) {
      console.error("Contact content save error:", result.error)
      return NextResponse.json({ error: "Failed to save contact content." }, { status: 500 })
    }

    return NextResponse.json({ success: true, content: result.data as ContactPageContent })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
