import { NextResponse } from "next/server"
import { fetchApprovedGuides } from "@/lib/tour-guides"

export async function GET() {
  try {
    const guides = await fetchApprovedGuides()
    return NextResponse.json({ guides })
  } catch (error) {
    console.error("GET /api/guides error:", error)
    return NextResponse.json({ error: "Failed to load guides." }, { status: 500 })
  }
}
