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

function rowsToMap(rows: { key: string; value: string | null }[]): SiteSettingsMap {
  const map = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if (row.key in map) {
      map[row.key as SiteSettingKey] = row.value ?? ""
    }
  }
  return map
}

export async function fetchSiteSettings(): Promise<SiteSettingsMap> {
  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase.from("site_settings").select("key, value")
    if (!error && data) return rowsToMap(data)
  } catch {
    // fallback
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.from("site_settings").select("key, value")
    if (error || !data) return DEFAULT_SETTINGS
    return rowsToMap(data)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function upsertSiteSettings(
  settings: Partial<SiteSettingsMap>,
): Promise<SiteSettingsMap> {
  const supabase = getSupabaseAdmin()

  for (const key of SITE_SETTING_KEYS) {
    if (settings[key] === undefined) continue
    const value = settings[key]?.trim() ?? ""
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" })
    if (error) throw error
  }

  const { data, error } = await supabase.from("site_settings").select("key, value")
  if (error) throw error
  return rowsToMap(data ?? [])
}
