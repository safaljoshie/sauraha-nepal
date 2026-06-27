import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  ensureListingPhotosBucket,
  getListingPhotosBucket,
  getStoragePublicUrl,
  isAllowedPhotoFile,
  MAX_PHOTO_BYTES,
  storageUploadErrorMessage,
  uniqueStorageFilename,
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

  const bucketError = await ensureListingPhotosBucket(supabase)
  if (bucketError) {
    console.error("Listing photos bucket setup error:", bucketError)
    return NextResponse.json(
      { error: storageUploadErrorMessage(bucketError) },
      { status: 500 },
    )
  }

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

    const filename = uniqueStorageFilename(file.name)
    const path = `${uploadFolder}/${filename}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType =
      file.type === "image/webp"
        ? "image/webp"
        : file.type === "image/png"
          ? "image/png"
          : file.type || "image/jpeg"

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
    })

    if (error) {
      console.error("Admin image upload error:", error)
      return NextResponse.json(
        { error: storageUploadErrorMessage(error) },
        { status: 500 },
      )
    }

    urls.push(getStoragePublicUrl(bucket, path, supabaseUrl))
  }

  return NextResponse.json({ urls })
}
