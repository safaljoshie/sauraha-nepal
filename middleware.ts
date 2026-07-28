import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth"
import { TEAM_COOKIE, isTeamAuthenticated } from "@/lib/team-auth"
import { updateSession } from "@/lib/supabase/middleware"

// Copies the refreshed Supabase auth cookies from `source` onto a redirect so
// the rotated session is not dropped when we short-circuit for admin/team gates.
function redirectWithSession(url: URL, source: NextResponse, status = 307) {
  const redirect = NextResponse.redirect(url, status)
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

// Matches exactly /listings/<uuid> (a legacy id-based URL, no trailing segments).
const LISTING_UUID_PATH =
  /^\/listings\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i

/**
 * Resolve an approved listing's slug from its UUID via the Supabase REST API.
 * Kept dependency-free (raw fetch) so it stays cheap in the Edge middleware, and
 * only ever runs for the rare legacy UUID listing URL. Anon key is enough — the
 * public read policy exposes approved listings.
 */
async function fetchApprovedListingSlug(id: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const res = await fetch(
      `${url}/rest/v1/business_listings?id=eq.${id}&status=eq.approved&select=slug&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
    )
    if (!res.ok) return null
    const rows = (await res.json()) as { slug: string | null }[]
    return rows[0]?.slug?.trim() || null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Always refresh the end-user Supabase session first (for the navbar user
  // menu, /account, and gated review submissions).
  const { response } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Legacy UUID listing URLs → their slug, as a real HTTP 308. Doing this in the
  // page via permanentRedirect only produces a client-side meta refresh (200)
  // because a page render is a streaming context; search engines need a true 3xx.
  const listingUuid = pathname.match(LISTING_UUID_PATH)
  if (listingUuid) {
    const slug = await fetchApprovedListingSlug(listingUuid[1])
    if (slug && slug !== listingUuid[1]) {
      return redirectWithSession(new URL(`/listings/${slug}`, request.url), response, 308)
    }
  }

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
