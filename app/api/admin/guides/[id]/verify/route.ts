import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  buildGuideProfilePath,
  fetchGuideByIdAdmin,
  normalizeTourGuide,
} from "@/lib/tour-guides"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  let body: { is_verified?: boolean }
  try {
    body = (await request.json()) as { is_verified?: boolean }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const nextVerified = body.is_verified === true

  try {
    const existing = await fetchGuideByIdAdmin(id)
    if (!existing) {
      return NextResponse.json({ error: "Guide not found." }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("tour_guides")
      .update({
        is_verified: nextVerified,
        verified_at: nextVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Verify guide error:", error)
      return NextResponse.json({ error: "Failed to update verification." }, { status: 500 })
    }

    const guide = normalizeTourGuide(data)
    revalidatePath("/guides")
    revalidatePath(buildGuideProfilePath(guide))
    return NextResponse.json({ success: true, guide })
  } catch (error) {
    console.error("PUT /api/admin/guides/[id]/verify error:", error)
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
