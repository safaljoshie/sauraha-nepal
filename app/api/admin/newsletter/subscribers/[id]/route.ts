import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase"

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id)

    if (error) {
      console.error("Newsletter delete subscriber error:", error)
      return NextResponse.json({ error: "Failed to delete subscriber." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
