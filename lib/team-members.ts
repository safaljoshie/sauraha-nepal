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

export const FOUNDER_TEAM_MEMBER: TeamMember = {
  id: "founder-safal-joshi",
  created_at: "2026-06-21T00:00:00.000Z",
  updated_at: "2026-06-21T00:00:00.000Z",
  name: "Safal Joshi",
  role: "Founder",
  image: "/images/team/safal-joshi.png",
  bio: "Sauraha Nepal. Based in Australia",
  display_order: -1,
  is_active: true,
}

function withFounderFirst(members: TeamMember[]): TeamMember[] {
  const rest = members.filter(
    (member) => member.name.trim().toLowerCase() !== FOUNDER_TEAM_MEMBER.name.toLowerCase(),
  )
  return [FOUNDER_TEAM_MEMBER, ...rest]
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
    if (!error && data) return withFounderFirst(data as TeamMember[])
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
    if (error || !data) return [FOUNDER_TEAM_MEMBER]
    return withFounderFirst(data as TeamMember[])
  } catch {
    return [FOUNDER_TEAM_MEMBER]
  }
}
