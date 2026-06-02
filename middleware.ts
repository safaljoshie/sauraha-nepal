import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ["/admin/:path*"],
}
