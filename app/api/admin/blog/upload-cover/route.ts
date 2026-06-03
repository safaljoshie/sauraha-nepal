import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  getListingPhotosBucket,
  getStoragePublicUrl,
  isAllowedPhotoFile,
  sanitizePhotoFilename,
} from "@/lib/list-business-photos"
import { getSupabaseAdmin } from "@/lib/supabase"

const MAX_BYTES = 10 * 1024 * 1024

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
    return NextResponse.json({ error: "Please choose an image to upload." }, { status: 400 })
  }

  if (!isAllowedPhotoFile(file)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WEBP images are allowed." },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 10 MB or smaller." }, { status: 400 })
  }

  const postId = typeof formData.get("postId") === "string" ? formData.get("postId") : ""
  const folder = postId
    ? `admin/site/blog/covers/${postId}`
    : `admin/site/blog/covers/${randomUUID()}`

  const filename = sanitizePhotoFilename(file.name)
  const path = `${folder}/${filename}`
  const bucket = getListingPhotosBucket()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  })

  if (error) {
    console.error("Blog cover upload error:", error)
    return NextResponse.json({ error: "Failed to upload image. Please try again." }, { status: 500 })
  }

  return NextResponse.json({
    url: getStoragePublicUrl(bucket, path, supabaseUrl),
  })
}
