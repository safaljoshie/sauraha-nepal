import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { revalidateCategoryCatalog } from "@/lib/listing-revalidate"
import { SLUG_RE } from "@/lib/category-catalog"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("category_groups")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true })

    if (error) {
      console.error("Category groups fetch error:", error)
      return NextResponse.json({ error: "Failed to load category groups." }, { status: 500 })
    }

    return NextResponse.json({ groups: data ?? [] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: {
    slug?: string
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

  const slug = body.slug?.trim().toLowerCase() ?? ""
  const label = body.label?.trim() ?? ""
  const tab_label = body.tab_label?.trim() ?? label

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug is required (lowercase letters, numbers, hyphens only)." },
      { status: 400 },
    )
  }
  if (slug === "all" || slug === "info") {
    return NextResponse.json({ error: "Slug is reserved." }, { status: 400 })
  }
  if (!label) {
    return NextResponse.json({ error: "Label is required." }, { status: 400 })
  }

  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.max(0, body.sort_order)
      : 0

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("category_groups")
      .insert({
        slug,
        label,
        tab_label,
        icon: body.icon?.trim() || null,
        sort_order,
        is_active: body.is_active !== false,
      })
      .select("*")
      .single()

    if (error || !data) {
      console.error("Category group create error:", error)
      const message =
        error?.code === "23505"
          ? "A group with this slug already exists."
          : "Failed to create category group."
      return NextResponse.json({ error: message }, { status: 500 })
    }

    revalidateCategoryCatalog()

    return NextResponse.json({ success: true, group: data })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
