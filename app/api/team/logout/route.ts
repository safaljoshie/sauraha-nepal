import { NextResponse } from "next/server"
import { requireTeamOrAdminApi } from "@/lib/calendar-access"
import { TEAM_COOKIE } from "@/lib/team-auth"

export async function POST() {
  const unauthorized = await requireTeamOrAdminApi()
  if (unauthorized) return unauthorized

  const response = NextResponse.json({ success: true })
  response.cookies.set(TEAM_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
