import type { TeamNoticePayload } from "@/lib/team-notices"
import { isNoticeVisible, sortNotices, type TeamNotice } from "@/lib/team-notices"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function fetchActiveTeamNotices() {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("team_calendar_notices")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return sortNotices((data ?? []) as TeamNotice[]).filter((notice) =>
    isNoticeVisible(notice),
  )
}

export async function fetchAllTeamNoticesAdmin() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("team_calendar_notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TeamNotice[]
}

export async function createTeamNotice(payload: TeamNoticePayload) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("team_calendar_notices")
    .insert({ ...payload, updated_at: now })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamNotice
}

export async function updateTeamNotice(id: string, payload: Partial<TeamNoticePayload>) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("team_calendar_notices")
    .update({ ...payload, updated_at: now })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamNotice
}

export async function deleteTeamNotice(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("team_calendar_notices").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
