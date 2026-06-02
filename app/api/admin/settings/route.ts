import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { SITE_SETTING_KEYS, type SiteSettingsMap } from "@/lib/site-settings-keys"
import { fetchSiteSettingsAdmin, upsertSiteSettings } from "@/lib/site-settings"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const settings = await fetchSiteSettingsAdmin()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to load settings."
    return NextResponse.json(
      { error: message.includes("site_settings") ? "Run supabase/site_settings.sql in Supabase first." : "Failed to load settings." },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: Partial<SiteSettingsMap>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const updates: Partial<SiteSettingsMap> = {}
  for (const key of SITE_SETTING_KEYS) {
    if (typeof body[key] === "string") {
      updates[key] = body[key]
    }
  }

  try {
    const settings = await upsertSiteSettings(updates)
    revalidatePath("/", "layout")
    revalidatePath("/contact")
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Settings save error:", error)
    const detail = error instanceof Error ? error.message : ""
    const hint = detail.includes("site_settings")
      ? "Run supabase/site_settings.sql in the Supabase SQL Editor."
      : "Failed to save settings."
    return NextResponse.json({ error: hint, detail: detail || undefined }, { status: 500 })
  }
}
