import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ error: "Category id is required." }, { status: 400 })
  }

  let body: {
    name?: string
    group_id?: string
    sort_order?: number
    is_active?: boolean
    update_listings?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: existing, error: fetchError } = await supabase
      .from("business_categories")
      .select("name")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 })
    }

    const newName = body.name?.trim()
    if (newName !== undefined && !newName) {
      return NextResponse.json({ error: "Category name cannot be empty." }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (newName !== undefined) update.name = newName
    if (body.group_id?.trim()) update.group_id = body.group_id.trim()
    if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
      update.sort_order = Math.max(0, body.sort_order)
    }
    if (typeof body.is_active === "boolean") update.is_active = body.is_active

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 })
    }

    if (body.update_listings && newName && newName !== existing.name) {
      const { error: listingsError } = await supabase
        .from("business_listings")
        .update({ category: newName })
        .eq("category", existing.name)

      if (listingsError) {
        console.error("Listing category rename error:", listingsError)
        return NextResponse.json(
          { error: "Failed to update existing listings with the new category name." },
          { status: 500 },
        )
      }
    }

    const { data, error } = await supabase
      .from("business_categories")
      .update(update)
      .eq("id", id)
      .select("*, category_groups(slug, label)")
      .single()

    if (error || !data) {
      console.error("Business category update error:", error)
      const message =
        error?.code === "23505"
          ? "A category with this name already exists."
          : "Failed to update category."
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ error: "Category id is required." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: existing, error: fetchError } = await supabase
      .from("business_categories")
      .select("name")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 })
    }

    const { count, error: countError } = await supabase
      .from("business_listings")
      .select("id", { count: "exact", head: true })
      .eq("category", existing.name)

    if (countError) {
      console.error("Category delete count error:", countError)
      return NextResponse.json({ error: "Failed to check listings." }, { status: 500 })
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `${count} listing${count === 1 ? "" : "s"} use this category. Deactivate it instead, or reassign listings first.`,
          listingCount: count,
        },
        { status: 409 },
      )
    }

    const { error } = await supabase.from("business_categories").delete().eq("id", id)

    if (error) {
      console.error("Business category delete error:", error)
      return NextResponse.json({ error: "Failed to delete category." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
