import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function isHttpUrl(value: string | undefined) {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function requireHttpUrl(value: string | undefined, errorMessage: string): string {
  if (!isHttpUrl(value)) {
    throw new Error(errorMessage)
  }
  return value as string
}

function requireEnv(value: string | undefined, errorMessage: string): string {
  if (!value) {
    throw new Error(errorMessage)
  }
  return value
}

/** Client-side Supabase client (anon key). */
let publicClient: SupabaseClient | null = null

export function getSupabasePublic() {
  if (publicClient) return publicClient

  const url = requireHttpUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Supabase public credentials are not configured.",
  )
  const anonKey = requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Supabase public credentials are not configured.",
  )
  publicClient = createClient(url, anonKey)
  return publicClient
}

/**
 * Whether a service-role client can actually be built in this environment.
 *
 * Read helpers try admin first and fall back to anon. Without this check the
 * admin attempt throws — and gets logged with a stack trace — on every single
 * call, which on a Preview deploy (anon key only) means dozens of identical
 * traces per build drowning out real errors. Missing credentials are a static
 * property of the environment, not a per-call failure.
 */
export function hasSupabaseAdminCredentials() {
  return (
    isHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
}

/**
 * Log a failed service-role attempt, unless the cause is simply that this
 * environment has no service-role key — in which case the anon fallback is the
 * expected path and there is nothing to report. Genuine admin failures
 * (network, RLS, malformed key) still log.
 */
export function logAdminFallback(label: string, error: unknown) {
  if (!hasSupabaseAdminCredentials()) return
  console.error(label, error)
}

let adminClient: SupabaseClient | null = null

/** Server-only Supabase client (service role key). Never import in client components. */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient

  const url = requireHttpUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Supabase admin credentials are not configured.",
  )
  const roleKey = requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Supabase admin credentials are not configured.",
  )
  adminClient = createClient(url, roleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}
