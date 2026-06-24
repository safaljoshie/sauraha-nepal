import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { normalizeCalendarPayload } from "@/lib/content-calendar"
import { deleteCalendarEntry, updateCalendarEntry } from "@/lib/content-calendar-db"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

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
    const entry = await updateCalendarEntry(id, normalized.data)
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Admin calendar update error:", error)
    return NextResponse.json({ error: "Failed to update calendar entry." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const status = body.status?.trim().toLowerCase()
  if (!status || !["draft", "scheduled", "published"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  try {
    const entry = await updateCalendarEntry(id, { status })
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Admin calendar status update error:", error)
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    await deleteCalendarEntry(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin calendar delete error:", error)
    return NextResponse.json({ error: "Failed to delete calendar entry." }, { status: 500 })
  }
}
