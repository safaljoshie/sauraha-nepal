import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  getListingPhotosBucket,
  getStoragePublicUrl,
  sanitizePhotoFilename,
} from "@/lib/list-business-photos"
import { getSupabaseAdmin } from "@/lib/supabase"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"])

function getUploadFolder(type: "image" | "video") {
  return `admin/site/hero/${type}/${randomUUID()}`
}

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
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose a file to upload." }, { status: 400 })
  }

  const mediaType = formData.get("type")
  const type = mediaType === "video" ? "video" : "image"
  const allowedTypes = type === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
  const maxSize = type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES

  if (!allowedTypes.has(file.type)) {
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
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: type === "video" ? "Video must be 50 MB or smaller." : "Image must be 10 MB or smaller.",
      },
      { status: 400 },
    )
  }

  const folder = getUploadFolder(type)
  const filename = sanitizePhotoFilename(file.name)
  const path = `${folder}/${filename}`
  const bucket = getListingPhotosBucket()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
    upsert: false,
  })

  if (error) {
    console.error("Hero media upload error:", error)
    return NextResponse.json({ error: "Failed to upload media. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ url: getStoragePublicUrl(bucket, path, supabaseUrl) })
}
