import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export type TeamMember = {
  id: string
  created_at: string
  updated_at: string
  name: string
  role: string
  image: string
  bio: string | null
  display_order: number
  is_active: boolean
}

export async function fetchActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
    if (!error && data) return data as TeamMember[]
  } catch {
    // fall through to public fallback
  }

  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
    if (error || !data) return []
    return data as TeamMember[]
  } catch {
    return []
  }
}
