export const SITE_SETTING_KEYS = [
  "facebook_url",
  "instagram_url",
  "twitter_url",
  "tiktok_url",
  "youtube_url",
  "whatsapp_number",
  "email",
] as const

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number]

export type SiteSettingsMap = Record<SiteSettingKey, string>
