import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const ADMIN_COOKIE = "admin_session"
export const ADMIN_SESSION_VALUE = "authenticated"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function isAdminAuthenticated(session: string | undefined) {
  return session === ADMIN_SESSION_VALUE
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value
}

export async function requireAdminApi() {
  const session = await getAdminSession()
  if (!isAdminAuthenticated(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
