import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { revalidateCategoryCatalog } from "@/lib/listing-revalidate"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ error: "Group id is required." }, { status: 400 })
  }

  let body: {
    label?: string
    tab_label?: string
    icon?: string
    sort_order?: number
    is_active?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const label = body.label?.trim()
  const tab_label = body.tab_label?.trim()
  if (label !== undefined && !label) {
    return NextResponse.json({ error: "Label cannot be empty." }, { status: 400 })
  }
  if (tab_label !== undefined && !tab_label) {
    return NextResponse.json({ error: "Tab label cannot be empty." }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (label !== undefined) update.label = label
  if (tab_label !== undefined) update.tab_label = tab_label
  if (body.icon !== undefined) update.icon = body.icon.trim() || null
  if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
    update.sort_order = Math.max(0, body.sort_order)
  }
  if (typeof body.is_active === "boolean") update.is_active = body.is_active

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("category_groups")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Category group update error:", error)
      return NextResponse.json({ error: "Failed to update category group." }, { status: 500 })
    }

    revalidateCategoryCatalog()

    return NextResponse.json({ success: true, group: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ error: "Group id is required." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { count, error: countError } = await supabase
      .from("business_categories")
      .select("id", { count: "exact", head: true })
      .eq("group_id", id)

    if (countError) {
      console.error("Category group delete count error:", countError)
      return NextResponse.json({ error: "Failed to check categories." }, { status: 500 })
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${count} categor${count === 1 ? "y" : "ies"} still use this group. Move or delete them first.`,
          listingCount: count,
        },
        { status: 409 },
      )
    }

    const { error } = await supabase.from("category_groups").delete().eq("id", id)

    if (error) {
      console.error("Category group delete error:", error)
      return NextResponse.json({ error: "Failed to delete category group." }, { status: 500 })
    }

    revalidateCategoryCatalog()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
