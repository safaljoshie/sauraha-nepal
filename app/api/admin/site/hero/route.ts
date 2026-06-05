import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import type { HeroMedia } from "@/lib/site-content"
import { getSupabaseAdmin } from "@/lib/supabase"

type HeroPayload = {
  id?: string
  type?: string
  url?: string
  poster_url?: string
  alt_text?: string
  is_active?: boolean
  priority?: number
}

function normalizeOptional(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizePriority(value: unknown) {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

function isValidMediaType(type: string | undefined): type is "video" {
  return type === "video"
}

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("hero_media")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Hero media fetch error:", error)
      return NextResponse.json({ error: "Failed to load hero media." }, { status: 500 })
    }

    return NextResponse.json({ media: (data ?? []) as HeroMedia[] })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: HeroPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const type = payload.type?.trim().toLowerCase()
  const url = payload.url?.trim() ?? ""
  if (!isValidMediaType(type)) {
    return NextResponse.json({ error: "Media type must be video." }, { status: 400 })
  }
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "URL must be a valid HTTP/HTTPS URL." }, { status: 400 })
  }

  const entry = {
    type,
    url,
    poster_url: normalizeOptional(payload.poster_url),
    alt_text: normalizeOptional(payload.alt_text),
    is_active: payload.is_active !== false,
    priority: normalizePriority(payload.priority),
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("hero_media")
      .insert(entry)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Hero media create error:", error)
      return NextResponse.json({ error: "Failed to create hero media." }, { status: 500 })
    }

    return NextResponse.json({ success: true, media: data as HeroMedia })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: HeroPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = payload.id?.trim()
  if (!id) {
    return NextResponse.json({ error: "Media id is required." }, { status: 400 })
  }

  const type = payload.type?.trim().toLowerCase()
  const url = payload.url?.trim() ?? ""
  if (!isValidMediaType(type)) {
    return NextResponse.json({ error: "Media type must be video." }, { status: 400 })
  }
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "URL must be a valid HTTP/HTTPS URL." }, { status: 400 })
  }

  const update = {
    type,
    url,
    poster_url: normalizeOptional(payload.poster_url),
    alt_text: normalizeOptional(payload.alt_text),
    is_active: payload.is_active !== false,
    priority: normalizePriority(payload.priority),
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("hero_media")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      console.error("Hero media update error:", error)
      return NextResponse.json({ error: "Failed to update hero media." }, { status: 500 })
    }

    return NextResponse.json({ success: true, media: data as HeroMedia })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: HeroPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = payload.id?.trim()
  if (!id) {
    return NextResponse.json({ error: "Media id is required." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("hero_media").delete().eq("id", id)

    if (error) {
      console.error("Hero media delete error:", error)
      return NextResponse.json({ error: "Failed to delete hero media." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
