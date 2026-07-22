import { createSupabaseServerClient } from "@/lib/supabase/auth-server"
import type { User } from "@supabase/supabase-js"

export type Profile = {
  id: string
  display_name: string | null
  country: string | null
  avatar_url: string | null
  email: string | null
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type ProfileView = {
  displayName: string
  country: string
  email: string
  avatarUrl: string | null
}

function metaString(user: User, key: string): string | null {
  const v = user.user_metadata?.[key]
  return typeof v === "string" ? v : null
}

/** Fold a profile row + auth metadata into the values the account UI renders. */
export function toProfileView(user: User, profile: Profile | null): ProfileView {
  return {
    displayName:
      profile?.display_name ||
      metaString(user, "full_name") ||
      metaString(user, "name") ||
      "",
    country: profile?.country || "",
    email: profile?.email || user.email || "",
    avatarUrl: profile?.avatar_url || metaString(user, "avatar_url"),
  }
}

/**
 * Returns the signed-in user and their profile row (via owner-RLS). Returns null
 * when nobody is signed in.
 */
export async function getOwnProfile(): Promise<{ user: User; profile: Profile | null } | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return { user, profile: (profile as Profile | null) ?? null }
}
