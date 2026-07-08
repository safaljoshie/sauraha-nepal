import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminApi } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  let body: { status?: string }
  try {
    body = (await request.json()) as { status?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const status = body.status?.trim()
  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("guide_reviews")
      .update({ status })
      .eq("id", id)
      .select("guide_id")
      .single()

    if (error || !data) {
      console.error("Update guide review error:", error)
      return NextResponse.json({ error: "Failed to update review." }, { status: 500 })
    }

    const guideId = String(data.guide_id)
    revalidatePath("/guides")
    revalidatePath(`/guides/${guideId}`)
    return NextResponse.json({ success: true, review: data })
  } catch (error) {
    console.error("PUT /api/admin/guide-reviews/[id] error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  try {
    const supabase = getSupabaseAdmin()
    const { data: existing } = await supabase
      .from("guide_reviews")
      .select("guide_id")
      .eq("id", id)
      .maybeSingle()

    const { error } = await supabase.from("guide_reviews").delete().eq("id", id)
    if (error) {
      console.error("Delete guide review error:", error)
      return NextResponse.json({ error: "Failed to delete review." }, { status: 500 })
    }

    if (existing?.guide_id) {
      revalidatePath(`/guides/${existing.guide_id}`)
    }
    revalidatePath("/guides")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/guide-reviews/[id] error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
