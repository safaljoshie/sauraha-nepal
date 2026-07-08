import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminApi } from "@/lib/admin-auth"
import { buildGuideUpdateRow, type GuideWritePayload } from "@/lib/guide-admin"
import {
  buildGuideProfilePath,
  fetchGuideByIdAdmin,
  normalizeTourGuide,
} from "@/lib/tour-guides"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  try {
    const guide = await fetchGuideByIdAdmin(id)
    if (!guide) {
      return NextResponse.json({ error: "Guide not found." }, { status: 404 })
    }
    return NextResponse.json({ guide })
  } catch (error) {
    console.error("GET /api/admin/guides/[id] error:", error)
    return NextResponse.json({ error: "Failed to load guide." }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  let payload: GuideWritePayload
  try {
    payload = (await request.json()) as GuideWritePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const built = buildGuideUpdateRow(payload)
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("tour_guides")
      .update(built.row)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Update guide error:", error)
      return NextResponse.json({ error: "Failed to update guide." }, { status: 500 })
    }

    const guide = normalizeTourGuide(data)
    revalidatePath("/guides")
    revalidatePath(buildGuideProfilePath(guide))
    return NextResponse.json({ success: true, guide })
  } catch (error) {
    console.error("PUT /api/admin/guides/[id] error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("tour_guides").delete().eq("id", id)
    if (error) {
      console.error("Delete guide error:", error)
      return NextResponse.json({ error: "Failed to delete guide." }, { status: 500 })
    }
    revalidatePath("/guides")
    revalidatePath(`/guides/${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/guides/[id] error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
