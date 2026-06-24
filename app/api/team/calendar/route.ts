import { NextResponse } from "next/server"
import { requireTeamOrAdminApi } from "@/lib/calendar-access"
import { fetchCalendarEntries } from "@/lib/content-calendar-db"

function methodNotAllowed() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function GET(request: Request) {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(request.url)

  try {
    const entries = await fetchCalendarEntries({
      month: searchParams.get("month") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      owner: searchParams.get("owner") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Team calendar fetch error:", error)
    return NextResponse.json({ error: "Failed to load calendar entries." }, { status: 500 })
  }
}

export async function POST() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized
  return methodNotAllowed()
}

export async function PUT() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized
  return methodNotAllowed()
}

export async function PATCH() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized
  return methodNotAllowed()
}

export async function DELETE() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized
  return methodNotAllowed()
}
