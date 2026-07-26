import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/auth-server"
import { getSupabaseAdmin, hasSupabaseAdminCredentials } from "@/lib/supabase"

// Only allow relative, same-site redirect targets to avoid open redirects.
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next
  return "/account"
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  // Support deployments behind a load balancer (Vercel sets x-forwarded-host).
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocal = process.env.NODE_ENV === "development"
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`

  if (!code) {
    return NextResponse.redirect(`${base}/signin?error=auth`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${base}/signin?error=auth`)
  }

  // Soft-delete guard: a deactivated account must not regain access.
  if (hasSupabaseAdminCredentials()) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("deleted_at")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.deleted_at) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${base}/signin?error=deactivated`)
      }
    }
  }

  return NextResponse.redirect(`${base}${next}`)
}
