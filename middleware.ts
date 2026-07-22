import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth"
import { TEAM_COOKIE, isTeamAuthenticated } from "@/lib/team-auth"
import { updateSession } from "@/lib/supabase/middleware"

// Copies the refreshed Supabase auth cookies from `source` onto a redirect so
// the rotated session is not dropped when we short-circuit for admin/team gates.
function redirectWithSession(url: URL, source: NextResponse) {
  const redirect = NextResponse.redirect(url)
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export async function middleware(request: NextRequest) {
  // Always refresh the end-user Supabase session first (for the navbar user
  // menu, /account, and gated review submissions).
  const { response } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Team content gate
  if (
    pathname.startsWith("/team/calendar") ||
    pathname.startsWith("/team/resources") ||
    pathname.startsWith("/team/itinerary")
  ) {
    const teamSession = request.cookies.get(TEAM_COOKIE)?.value
    const adminSession = request.cookies.get(ADMIN_COOKIE)?.value
    if (!isTeamAuthenticated(teamSession) && !isAdminAuthenticated(adminSession)) {
      return redirectWithSession(new URL("/team", request.url), response)
    }
    return response
  }

  // Admin gate (the /admin login page itself stays public)
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    const session = request.cookies.get(ADMIN_COOKIE)?.value
    if (!isAdminAuthenticated(session)) {
      const loginUrl = new URL("/admin", request.url)
      loginUrl.searchParams.set("from", pathname)
      return redirectWithSession(loginUrl, response)
    }
  }

  return response
}

export const config = {
  // Run on all page routes so the Supabase session stays fresh, but skip Next
  // internals, static assets, and API routes (those read the session directly).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
}
