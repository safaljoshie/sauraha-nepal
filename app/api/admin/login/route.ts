import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_VALUE,
  adminSessionCookieOptions,
} from "@/lib/admin-auth"

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
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

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, ADMIN_SESSION_VALUE, adminSessionCookieOptions())
  return response
}
