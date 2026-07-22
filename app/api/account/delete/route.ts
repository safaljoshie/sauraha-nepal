import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"
import { getSupabaseAdmin, hasSupabaseAdminCredentials } from "@/lib/supabase"
import { rateLimit } from "@/lib/rate-limit"
import { rateLimitMessage } from "@/lib/security-messages"

// Soft delete: the auth.users record and review rows are retained. We flag the
// profile as deactivated and pull the user's reviews from public view. The
// client signs out afterwards; the OAuth callback blocks re-login.
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

  if (!hasSupabaseAdminCredentials()) {
    return NextResponse.json(
      { error: "Account deletion is not available in this environment." },
      { status: 503 },
    )
  }

  try {
    const admin = getSupabaseAdmin()
    const now = new Date().toISOString()

    const { error: profileError } = await admin
      .from("profiles")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", user.id)
    if (profileError) throw profileError

    // Retain review rows (no hard delete) but remove them from public view.
    // status change recomputes guide/business aggregates via the rating triggers.
    await admin.from("guide_reviews").update({ status: "removed" }).eq("user_id", user.id)
    await admin.from("business_reviews").update({ status: "removed" }).eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/account/delete error:", error)
    return NextResponse.json({ error: "Could not delete your account." }, { status: 500 })
  }
}
