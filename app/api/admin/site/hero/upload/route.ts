import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  buildHeroStoragePath,
  ensureHeroStorageBucket,
  getHeroPublicUrl,
  isAllowedHeroFile,
  resolveHeroContentType,
} from "@/lib/hero-media-upload"
import { getListingPhotosBucket } from "@/lib/list-business-photos"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid upload request. Large videos should upload via the dashboard video button (direct to storage).",
      },
      { status: 400 },
    )
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose a file to upload." }, { status: 400 })
  }

  const mediaType = formData.get("type")
  const type = mediaType === "video" ? "video" : "image"

  const allowed = isAllowedHeroFile(type, file)
  if (!allowed.ok) {
    return NextResponse.json({ error: allowed.error }, { status: 400 })
  }

  const contentType = resolveHeroContentType(type, file)
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

  const path = buildHeroStoragePath(type, file.name)
  const bucket = getListingPhotosBucket()

  if (type === "video") {
    await ensureHeroStorageBucket(supabase, bucket)
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  })

  if (error) {
    console.error("Hero media upload error:", error)
    const message =
      error.message?.trim() ||
      "Failed to upload media. Check storage bucket permissions and try again."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ url: getHeroPublicUrl(path, supabaseUrl) })
}
