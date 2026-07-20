import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { revalidateCategoryCatalog } from "@/lib/listing-revalidate"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("business_categories")
      .select("*, category_groups(slug, label)")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Business categories fetch error:", error)
      return NextResponse.json({ error: "Failed to load categories." }, { status: 500 })
    }

    return NextResponse.json({ categories: data ?? [] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: {
    name?: string
    group_id?: string
    sort_order?: number
    is_active?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim() ?? ""
  const group_id = body.group_id?.trim() ?? ""

  if (!name) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 })
  }
  if (!group_id) {
    return NextResponse.json({ error: "Group is required." }, { status: 400 })
  }

  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.max(0, body.sort_order)
      : 0

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("business_categories")
      .insert({
        name,
        group_id,
        sort_order,
        is_active: body.is_active !== false,
      })
      .select("*, category_groups(slug, label)")
      .single()

    if (error || !data) {
      console.error("Business category create error:", error)
      const message =
        error?.code === "23505"
          ? "A category with this name already exists."
          : "Failed to create category."
      return NextResponse.json({ error: message }, { status: 500 })
    }

    revalidateCategoryCatalog()

    return NextResponse.json({ success: true, category: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
