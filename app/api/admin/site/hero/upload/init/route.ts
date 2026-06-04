import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { getListingPhotosBucket } from "@/lib/list-business-photos"
import {
  buildHeroStoragePath,
  ensureHeroStorageBucket,
  getHeroPublicUrl,
  isAllowedHeroFile,
  resolveHeroContentType,
  type HeroMediaUploadType,
} from "@/lib/hero-media-upload"
import { getSupabaseAdmin } from "@/lib/supabase"

type InitPayload = {
  type?: string
  filename?: string
  size?: number
  mimeType?: string
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  let payload: InitPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const type: HeroMediaUploadType = payload.type === "video" ? "video" : "image"
  const filename = typeof payload.filename === "string" ? payload.filename.trim() : ""
  const size = typeof payload.size === "number" ? payload.size : Number(payload.size)

  if (!filename) {
    return NextResponse.json({ error: "Filename is required." }, { status: 400 })
  }
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "File size is required." }, { status: 400 })
  }

  const mimeType = typeof payload.mimeType === "string" ? payload.mimeType : ""
  const fileLike = { name: filename, type: mimeType, size }
  const allowed = isAllowedHeroFile(type, fileLike)
  if (!allowed.ok) {
    return NextResponse.json({ error: allowed.error }, { status: 400 })
  }

  const contentType = resolveHeroContentType(type, fileLike)
  if (!contentType) {
    return NextResponse.json(
      {
        error:
          type === "video"
            ? "Only MP4 and WEBM videos are allowed."
            : "Only JPEG, PNG, and WEBP images are allowed.",
      },
      { status: 400 },
    )
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  const path = buildHeroStoragePath(type, filename)
  const bucket = getListingPhotosBucket()

  if (type === "video") {
    const bucketError = await ensureHeroStorageBucket(supabase, bucket)
    if (bucketError) {
      console.warn("Hero bucket settings update:", bucketError.message)
    }
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)

  if (error || !data?.token) {
    console.error("Hero signed upload init error:", error)
    const message =
      error?.message?.trim() ||
      "Failed to prepare upload. Check that the storage bucket exists and allows uploads."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({
    bucket,
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    contentType,
    url: getHeroPublicUrl(path, supabaseUrl),
  })
}
