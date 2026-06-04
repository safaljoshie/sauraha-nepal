import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export type ContactPageContent = {
  id: string
  created_at: string
  updated_at: string
  heading: string
  subheading: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  response_time: string | null
}

export type HeroMedia = {
  id: string
  created_at: string
  updated_at: string
  type: "image" | "video"
  url: string
  poster_url: string | null
  alt_text: string | null
  is_active: boolean
  priority: number
}

export async function fetchContactPageContent(): Promise<ContactPageContent | null> {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from("contact_page_content")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!error && data) return data as ContactPageContent
  } catch {
    // fallback below
  }

  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase
      .from("contact_page_content")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data as ContactPageContent
  } catch {
    return null
  }
}

export async function fetchActiveHeroMedia(): Promise<HeroMedia[]> {
  return fetchActiveHeroVideos()
}

/** Active homepage hero videos only (images are ignored for now). */
export async function fetchActiveHeroVideos(): Promise<HeroMedia[]> {
  const query = (client: SupabaseClient) =>
    client
      .from("hero_media")
      .select("*")
      .eq("is_active", true)
      .eq("type", "video")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await query(admin)
    if (!error && data) return data as HeroMedia[]
  } catch {
    // fallback below
  }

  try {
    const supabase = getSupabasePublic()
    const { data, error } = await query(supabase)
    if (error || !data) return []
    return data as HeroMedia[]
  } catch {
    return []
  }
}
