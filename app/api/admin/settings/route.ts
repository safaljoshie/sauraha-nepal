import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { SITE_SETTING_KEYS, type SiteSettingsMap } from "@/lib/site-settings-keys"
import { fetchSiteSettings, upsertSiteSettings } from "@/lib/site-settings"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const settings = await fetchSiteSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 })
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
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 })
  }
}
