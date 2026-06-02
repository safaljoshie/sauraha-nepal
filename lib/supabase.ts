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
