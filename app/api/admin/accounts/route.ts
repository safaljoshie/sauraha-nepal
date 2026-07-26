import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export type AdminAccount = {
  id: string
  email: string | null
  display_name: string | null
  country: string | null
  created_at: string | null
  deleted_at: string | null
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, country, created_at, deleted_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Admin accounts fetch error:", error)
      return NextResponse.json({ error: "Failed to load accounts." }, { status: 500 })
    }

    return NextResponse.json({ accounts: (data ?? []) as AdminAccount[] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
