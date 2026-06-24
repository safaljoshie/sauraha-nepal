import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const TEAM_COOKIE = "team_session"
export const TEAM_SESSION_VALUE = "authenticated"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function isTeamAuthenticated(session: string | undefined) {
  return session === TEAM_SESSION_VALUE
}

export function teamSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }
}

export async function getTeamSession() {
  const cookieStore = await cookies()
  return cookieStore.get(TEAM_COOKIE)?.value
}
