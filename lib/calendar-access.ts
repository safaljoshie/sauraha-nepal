import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth"
import { TEAM_COOKIE, isTeamAuthenticated } from "@/lib/team-auth"

export async function hasTeamOrAdminAccess() {
  const cookieStore = await cookies()
  const teamSession = cookieStore.get(TEAM_COOKIE)?.value
  const adminSession = cookieStore.get(ADMIN_COOKIE)?.value
  return isTeamAuthenticated(teamSession) || isAdminAuthenticated(adminSession)
}

export async function requireTeamOrAdminApi() {
  if (!(await hasTeamOrAdminAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
