import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { normalizeNoticePayload } from "@/lib/team-notices"
import { createTeamNotice, fetchAllTeamNoticesAdmin } from "@/lib/team-notices-db"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const notices = await fetchAllTeamNoticesAdmin()
    return NextResponse.json({ notices })
  } catch (error) {
    console.error("Admin notices fetch error:", error)
    return NextResponse.json({ error: "Failed to load notices." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const normalized = normalizeNoticePayload(body as Parameters<typeof normalizeNoticePayload>[0])
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  try {
    const notice = await createTeamNotice(normalized.data)
    return NextResponse.json({ success: true, notice })
  } catch (error) {
    console.error("Admin notice create error:", error)
    return NextResponse.json({ error: "Failed to create notice." }, { status: 500 })
  }
}
