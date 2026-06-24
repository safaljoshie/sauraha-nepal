import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { normalizeNoticePayload } from "@/lib/team-notices"
import { deleteTeamNotice, updateTeamNotice } from "@/lib/team-notices-db"

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

  const normalized = normalizeNoticePayload(body as Parameters<typeof normalizeNoticePayload>[0])
  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 })
  }

  try {
    const notice = await updateTeamNotice(id, normalized.data)
    return NextResponse.json({ success: true, notice })
  } catch (error) {
    console.error("Admin notice update error:", error)
    return NextResponse.json({ error: "Failed to update notice." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  let body: { is_active?: boolean; is_pinned?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const patch: { is_active?: boolean; is_pinned?: boolean } = {}
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active
  if (typeof body.is_pinned === "boolean") patch.is_pinned = body.is_pinned

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 })
  }

  try {
    const notice = await updateTeamNotice(id, patch)
    return NextResponse.json({ success: true, notice })
  } catch (error) {
    console.error("Admin notice patch error:", error)
    return NextResponse.json({ error: "Failed to update notice." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    await deleteTeamNotice(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin notice delete error:", error)
    return NextResponse.json({ error: "Failed to delete notice." }, { status: 500 })
  }
}
