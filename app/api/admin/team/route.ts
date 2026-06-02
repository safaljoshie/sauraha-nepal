import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { TeamMember } from "@/lib/team-members"
import { getSupabaseAdmin } from "@/lib/supabase"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type TeamPayload = {
  id?: string
  name?: string
  role?: string
  image?: string
  bio?: string
  display_order?: number
  is_active?: boolean
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeBio(value: unknown) {
  if (typeof value !== "string") return null
  const v = value.trim()
  return v.length > 0 ? v : null
}

function normalizeDisplayOrder(value: unknown) {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

function validatePayload(payload: TeamPayload) {
  const name = normalizeText(payload.name)
  const role = normalizeText(payload.role)
  const image = normalizeText(payload.image)
  const bio = normalizeBio(payload.bio)
  const display_order = normalizeDisplayOrder(payload.display_order)
  const is_active = payload.is_active !== false

  if (!name || !role || !image) {
    return { error: "Name, role/title, and photo are required." as const }
  }
  if (!/^https?:\/\//i.test(image)) {
    return { error: "Photo must be a valid URL." as const }
  }

  return {
    data: { name, role, image, bio, display_order, is_active },
  }
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase team fetch error:", error)
      return NextResponse.json({ error: "Failed to load team members." }, { status: 500 })
    }

    return NextResponse.json({ members: (data ?? []) as TeamMember[] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: TeamPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const validated = validatePayload(payload)
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("team_members")
      .insert(validated.data)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Supabase team insert error:", error)
      return NextResponse.json({ error: "Failed to create team member." }, { status: 500 })
    }

    return NextResponse.json({ success: true, member: data as TeamMember })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: TeamPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = normalizeText(payload.id)
  if (!id) {
    return NextResponse.json({ error: "Member id is required." }, { status: 400 })
  }

  const validated = validatePayload(payload)
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("team_members")
      .update(validated.data)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Supabase team update error:", error)
      return NextResponse.json({ error: "Failed to update team member." }, { status: 500 })
    }

    return NextResponse.json({ success: true, member: data as TeamMember })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: TeamPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = normalizeText(payload.id)
  if (!id) {
    return NextResponse.json({ error: "Member id is required." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Supabase team delete error:", error)
      return NextResponse.json({ error: "Failed to delete team member." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
