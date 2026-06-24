import type { CalendarFilters, ContentCalendarPayload } from "@/lib/content-calendar"
import { monthDateRange } from "@/lib/content-calendar"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function fetchCalendarEntries(filters: CalendarFilters = {}) {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("content_calendar")
    .select("*")
    .order("scheduled_date", { ascending: true })

  if (filters.month) {
    const { start, end } = monthDateRange(filters.month)
    query = query.gte("scheduled_date", start).lte("scheduled_date", end)
  }

  if (filters.platform && filters.platform !== "All") {
    query = query.eq("platform", filters.platform)
  }

  if (filters.status && filters.status !== "All") {
    query = query.eq("status", filters.status.toLowerCase())
  }

  if (filters.owner && filters.owner !== "All") {
    query = query.eq("owner", filters.owner)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  let entries = data ?? []

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    entries = entries.filter((entry) =>
      String(entry.content_title).toLowerCase().includes(q),
    )
  }

  return entries
}

export async function createCalendarEntry(payload: ContentCalendarPayload) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("content_calendar")
    .insert({
      ...payload,
      updated_at: now,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateCalendarEntry(id: string, payload: Partial<ContentCalendarPayload>) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("content_calendar")
    .update({
      ...payload,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteCalendarEntry(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("content_calendar").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
