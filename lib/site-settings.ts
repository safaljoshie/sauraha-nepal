import { cache } from "react"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"
import {
  SITE_SETTING_KEYS,
  type SiteSettingKey,
  type SiteSettingsMap,
} from "@/lib/site-settings-keys"

export type { SiteSettingKey, SiteSettingsMap }
export { SITE_SETTING_KEYS }

const DEFAULT_SETTINGS: SiteSettingsMap = {
  facebook_url: "https://facebook.com/saurahanepal",
  instagram_url: "https://instagram.com/saurahanepal",
  twitter_url: "",
  tiktok_url: "",
  youtube_url: "",
  whatsapp_number: "",
  email: "hello@mail.saurahanepal.com",
}

function emptySettingsMap(): SiteSettingsMap {
  return {
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    tiktok_url: "",
    youtube_url: "",
    whatsapp_number: "",
    email: "",
  }
}

/** Public/footer: DB values with defaults only for keys missing from the table. */
function rowsToPublicMap(rows: { key: string; value: string | null }[]): SiteSettingsMap {
  const map = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if (row.key in map) {
      map[row.key as SiteSettingKey] = row.value ?? ""
    }
  }
  return map
}

/** Admin: exact DB values, no placeholder defaults mixed in. */
function rowsToAdminMap(rows: { key: string; value: string | null }[]): SiteSettingsMap {
  const map = emptySettingsMap()
  for (const row of rows) {
    if (row.key in map) {
      map[row.key as SiteSettingKey] = row.value ?? ""
    }
  }
  return map
}

export const fetchSiteSettings = cache(async (): Promise<SiteSettingsMap> => {
  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase.from("site_settings").select("key, value")
    if (!error && data && data.length > 0) return rowsToPublicMap(data)
  } catch {
    // fallback below
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.from("site_settings").select("key, value")
    if (error) throw error
    if (!data || data.length === 0) return DEFAULT_SETTINGS
    return rowsToPublicMap(data)
  } catch {
    return DEFAULT_SETTINGS
  }
})

/** Server-only: read settings for admin UI (service role). */
export async function fetchSiteSettingsAdmin(): Promise<SiteSettingsMap> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("site_settings").select("key, value")
  if (error) throw error
  return rowsToAdminMap(data ?? [])
}

export async function upsertSiteSettings(
  settings: Partial<SiteSettingsMap>,
): Promise<SiteSettingsMap> {
  const supabase = getSupabaseAdmin()

  for (const key of SITE_SETTING_KEYS) {
    if (settings[key] === undefined) continue
    const value = settings[key]?.trim() ?? ""

    const { data: existing, error: findError } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle()

    if (findError) throw findError

    if (existing?.id) {
      const { error } = await supabase.from("site_settings").update({ value }).eq("key", key)
      if (error) throw error
    } else {
      const { error } = await supabase.from("site_settings").insert({ key, value })
      if (error) throw error
    }
  }

  return fetchSiteSettingsAdmin()
}

export const TEAM_RESOURCES_ONLINE_FORM_KEY = "team_resources_online_form_url"

export async function fetchTeamResourcesOnlineFormUrl(): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", TEAM_RESOURCES_ONLINE_FORM_KEY)
    .maybeSingle()

  if (error) throw error
  return data?.value?.trim() ?? ""
}

export async function upsertTeamResourcesOnlineFormUrl(url: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const value = url.trim()

  const { data: existing, error: findError } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", TEAM_RESOURCES_ONLINE_FORM_KEY)
    .maybeSingle()

  if (findError) throw findError

  if (existing?.id) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", TEAM_RESOURCES_ONLINE_FORM_KEY)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from("site_settings")
      .insert({ key: TEAM_RESOURCES_ONLINE_FORM_KEY, value })
    if (error) throw error
  }

  return value
}
