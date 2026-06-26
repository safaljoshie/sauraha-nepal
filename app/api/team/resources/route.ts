import { NextResponse } from "next/server"
import { requireTeamOrAdminApi } from "@/lib/calendar-access"
import { attachSignedDownloadUrls, fetchTeamResources } from "@/lib/team-resources-db"

function methodNotAllowed() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function GET() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized

  try {
    const resources = await fetchTeamResources()
    const resourcesWithUrls = await attachSignedDownloadUrls(resources)
    return NextResponse.json({ resources: resourcesWithUrls })
  } catch (error) {
    console.error("Team resources fetch error:", error)
    return NextResponse.json({ error: "Failed to load team resources." }, { status: 500 })
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
