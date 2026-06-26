import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth"
import { TEAM_COOKIE, isTeamAuthenticated } from "@/lib/team-auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/team/calendar") ||
    pathname.startsWith("/team/resources") ||
    pathname.startsWith("/team/itinerary")
  ) {
    const teamSession = request.cookies.get(TEAM_COOKIE)?.value
    const adminSession = request.cookies.get(ADMIN_COOKIE)?.value

    if (!isTeamAuthenticated(teamSession) && !isAdminAuthenticated(adminSession)) {
      return NextResponse.redirect(new URL("/team", request.url))
    }

    return NextResponse.next()
  }

  if (pathname === "/admin" || !pathname.startsWith("/admin/")) {
    return NextResponse.next()
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value
  if (!isAdminAuthenticated(session)) {
    const loginUrl = new URL("/admin", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/team/calendar", "/team/resources", "/team/itinerary"],
}
