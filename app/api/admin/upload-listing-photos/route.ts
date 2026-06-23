import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  getListingPhotosBucket,
  getStoragePublicUrl,
  isAllowedPhotoFile,
  MAX_PHOTO_BYTES,
  sanitizePhotoFilename,
} from "@/lib/list-business-photos"
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
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: "Please choose at least one image." }, { status: 400 })
  }

  const folder = formData.get("folder")
  const uploadFolder =
    typeof folder === "string" && folder.trim()
      ? folder.trim().replace(/[^a-zA-Z0-9/_-]/g, "_")
      : `admin/${randomUUID()}`

  const bucket = getListingPhotosBucket()
  const urls: string[] = []

  for (const file of files) {
    if (!isAllowedPhotoFile(file)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP, and HEIC images are allowed." },
        { status: 400 },
      )
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 15 MB or smaller." },
        { status: 400 },
      )
    }

    const filename = sanitizePhotoFilename(file.name)
    const path = `${uploadFolder}/${filename}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type === "image/webp" ? "image/webp" : file.type || "image/jpeg",
      upsert: false,
    })

    if (error) {
      console.error("Admin image upload error:", error)
      return NextResponse.json(
        { error: "Failed to upload image. Please try again." },
        { status: 500 },
      )
    }

    urls.push(getStoragePublicUrl(bucket, path, supabaseUrl))
  }

  return NextResponse.json({ urls })
}
