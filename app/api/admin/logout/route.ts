import { NextResponse } from "next/server"
import { ADMIN_COOKIE, requireAdminApi } from "@/lib/admin-auth"

export async function POST() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
