import { cache } from "react"
import {
  createSupabaseServerClient,
  getCurrentUser,
  type SessionUser,
} from "@/lib/supabase/auth-server"

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

function metaString(user: SessionUser, key: string): string | null {
  const v = user.user_metadata?.[key]
  return typeof v === "string" ? v : null
}

/** Fold a profile row + auth metadata into the values the account UI renders. */
export function toProfileView(user: SessionUser, profile: Profile | null): ProfileView {
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
 * Returns the signed-in user and their profile row (via owner-RLS), or null.
 * Wrapped in React `cache()` so the /account layout and page share a single
 * auth check + profile query per request instead of each running their own.
 */
export const getOwnProfile = cache(
  async (): Promise<{ user: SessionUser; profile: Profile | null } | null> => {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    return { user, profile: (profile as Profile | null) ?? null }
  },
)
