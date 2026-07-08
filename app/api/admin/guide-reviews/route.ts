import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { fetchAllGuideReviewsAdmin } from "@/lib/tour-guides"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const reviews = await fetchAllGuideReviewsAdmin()
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("GET /api/admin/guide-reviews error:", error)
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 })
  }
}
