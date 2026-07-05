import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | null = null

/** Server-only Supabase client (service role — bypasses RLS). */
export function createClient() {
  if (serverClient) return serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured.")
  }

  serverClient = createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return serverClient
}
