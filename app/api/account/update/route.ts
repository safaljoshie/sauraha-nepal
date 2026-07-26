import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"
import { getSupabaseAdmin, hasSupabaseAdminCredentials } from "@/lib/supabase"
import { rateLimit } from "@/lib/rate-limit"
import { rateLimitMessage } from "@/lib/security-messages"

type Body = { display_name?: string; country?: string }

export async function POST(request: Request) {
  const limit = await rateLimit(request, "ACCOUNT_MUTATION")
  if (!limit.allowed) {
    return NextResponse.json(
      { error: rateLimitMessage(limit.retryAfter), retryAfter: limit.retryAfter },
      { status: 429 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const displayName = (body.display_name ?? "").trim()
  const country = (body.country ?? "").trim()
  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 })
  }
  if (displayName.length > 80) {
    return NextResponse.json({ error: "Display name is too long." }, { status: 400 })
  }
  if (country.length > 60) {
    return NextResponse.json({ error: "Country is too long." }, { status: 400 })
  }

  const patch = {
    display_name: displayName,
    country: country || null,
    updated_at: new Date().toISOString(),
  }

  try {
    if (hasSupabaseAdminCredentials()) {
      // Upsert with the service role so a missing profile row (no INSERT policy)
      // is created; we've already authenticated the user server-side.
      const { error } = await getSupabaseAdmin()
        .from("profiles")
        .upsert({ id: user.id, email: user.email, ...patch }, { onConflict: "id" })
      if (error) throw error
    } else {
      // Local dev without a service role key: owner-RLS update of the existing row.
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id)
      if (error) throw error
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/account/update error:", error)
    return NextResponse.json({ error: "Could not save your changes." }, { status: 500 })
  }
}
