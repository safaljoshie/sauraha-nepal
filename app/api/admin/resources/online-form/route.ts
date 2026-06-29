import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  fetchTeamResourcesOnlineFormUrl,
  upsertTeamResourcesOnlineFormUrl,
} from "@/lib/site-settings"

function validateOnlineFormUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return ""

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return trimmed
  } catch {
    return null
  }
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const url = await fetchTeamResourcesOnlineFormUrl()
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Online form URL fetch error:", error)
    const message = error instanceof Error ? error.message : "Failed to load online form link."
    return NextResponse.json(
      {
        error: message.includes("site_settings")
          ? "Run supabase/site_settings.sql and supabase/team_resources_online_form.sql in Supabase first."
          : "Failed to load online form link.",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "URL is required." }, { status: 400 })
  }

  const validated = validateOnlineFormUrl(body.url)
  if (validated === null) {
    return NextResponse.json(
      { error: "Enter a valid http or https URL (e.g. a Google Form link)." },
      { status: 400 },
    )
  }

  try {
    const url = await upsertTeamResourcesOnlineFormUrl(validated)
    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error("Online form URL save error:", error)
    const message = error instanceof Error ? error.message : "Failed to save online form link."
    return NextResponse.json(
      {
        error: message.includes("site_settings")
          ? "Run supabase/site_settings.sql and supabase/team_resources_online_form.sql in Supabase first."
          : "Failed to save online form link.",
      },
      { status: 500 },
    )
  }
}
