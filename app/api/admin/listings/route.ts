import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { BusinessListing } from "@/lib/business-listing"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("business_listings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { error: "Failed to load listings." },
        { status: 500 },
      )
    }

    return NextResponse.json({ listings: (data ?? []) as BusinessListing[] })
  } catch {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 },
    )
  }
}
