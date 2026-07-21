import { NextResponse } from "next/server"
import { fetchSaurahaWeather } from "@/lib/sauraha-weather"

/**
 * Weather is served from here rather than rendered into the homepage.
 *
 * The open-meteo fetch used to carry `next: { revalidate: 1800 }`, and an
 * individual fetch's TTL becomes the revalidation period of the whole route —
 * so a weather pill was forcing the entire homepage (and its six Supabase
 * queries) to regenerate every 30 minutes. Owning the TTL here instead leaves
 * the homepage fully static.
 *
 * `dynamic = "force-static"` is required: route handlers are not cached by
 * default, and `revalidate` alone does nothing without it.
 */
export const dynamic = "force-static"
export const revalidate = 1800

export async function GET() {
  try {
    const weather = await fetchSaurahaWeather()
    return NextResponse.json({ weather })
  } catch (error) {
    console.error("GET /api/weather error:", error)
    return NextResponse.json({ error: "Failed to load weather." }, { status: 500 })
  }
}
