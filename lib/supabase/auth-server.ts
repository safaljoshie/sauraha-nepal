import { cache } from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// Cookie-aware Supabase client bound to the request cookies, for Server
// Components and Route Handlers that need the signed-in user's session.
// NOTE: distinct from lib/supabase/server.ts (service-role, bypasses RLS).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Session refresh is handled in middleware, so this is safe to ignore.
          }
        },
      },
    },
  )
}

export type SessionUser = {
  id: string
  email: string | null
  user_metadata: Record<string, unknown>
}

/**
 * The signed-in user for page/render reads, or null.
 *
 * Uses `getClaims()` — which verifies the JWT locally (no network round-trip)
 * when the project uses asymmetric JWT signing keys, and transparently falls
 * back to `getUser()` otherwise — and is wrapped in React `cache()` so the
 * layout and page in a single request share one call instead of each hitting
 * Supabase. For write paths (review/account mutations) keep using
 * `getUser()` directly for its stronger server-side revalidation.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (error || !claims) return null
  return {
    id: String(claims.sub),
    email: (claims.email as string | undefined) ?? null,
    user_metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
  }
})
