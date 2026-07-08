import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { buildGuideInsertRow, type GuideWritePayload } from "@/lib/guide-admin"
import { fetchAllGuidesAdmin, normalizeTourGuide } from "@/lib/tour-guides"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const guides = await fetchAllGuidesAdmin()
    return NextResponse.json({ guides })
  } catch (error) {
    console.error("GET /api/admin/guides error:", error)
    return NextResponse.json({ error: "Failed to load guides." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: GuideWritePayload
  try {
    payload = (await request.json()) as GuideWritePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const built = buildGuideInsertRow(payload)
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("tour_guides")
      .insert(built.row)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Create guide error:", error)
      return NextResponse.json({ error: "Failed to create guide." }, { status: 500 })
    }

    return NextResponse.json({ success: true, guide: normalizeTourGuide(data) })
  } catch (error) {
    console.error("POST /api/admin/guides error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
