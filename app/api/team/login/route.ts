import { NextResponse } from "next/server"
import {
  TEAM_COOKIE,
  TEAM_SESSION_VALUE,
  teamSessionCookieOptions,
} from "@/lib/team-auth"

export async function POST(request: Request) {
  const teamPassword = process.env.TEAM_PASSWORD
  if (!teamPassword) {
    return NextResponse.json(
      { error: "Team login is not configured." },
      { status: 500 },
    )
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const password = body.password?.trim() ?? ""
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 })
  }

  if (password !== teamPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(TEAM_COOKIE, TEAM_SESSION_VALUE, teamSessionCookieOptions())
  return response
}
