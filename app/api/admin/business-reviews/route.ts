import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { fetchAllBusinessReviewsAdmin } from "@/lib/business-reviews"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const reviews = await fetchAllBusinessReviewsAdmin()
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("GET /api/admin/business-reviews error:", error)
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 })
  }
}
