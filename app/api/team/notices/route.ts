import { NextResponse } from "next/server"
import { requireTeamOrAdminApi } from "@/lib/calendar-access"
import { fetchActiveTeamNotices } from "@/lib/team-notices-db"

function methodNotAllowed() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function GET() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized

  try {
    const notices = await fetchActiveTeamNotices()
    return NextResponse.json({ notices })
  } catch (error) {
    console.error("Team notices fetch error:", error)
    return NextResponse.json({ error: "Failed to load notices." }, { status: 500 })
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

export async function DELETE() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized
  return methodNotAllowed()
}
