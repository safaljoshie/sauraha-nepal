import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { normalizeCalendarPayload } from "@/lib/content-calendar"
import { createCalendarEntry, fetchCalendarEntries } from "@/lib/content-calendar-db"

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(request.url)

  try {
    const entries = await fetchCalendarEntries({
      month: searchParams.get("month") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      owner: searchParams.get("owner") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Admin calendar fetch error:", error)
    return NextResponse.json({ error: "Failed to load calendar entries." }, { status: 500 })
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

  const normalized = normalizeCalendarPayload(body as Parameters<typeof normalizeCalendarPayload>[0])
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  try {
    const entry = await createCalendarEntry(normalized.data)
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Admin calendar create error:", error)
    return NextResponse.json({ error: "Failed to create calendar entry." }, { status: 500 })
  }
}
