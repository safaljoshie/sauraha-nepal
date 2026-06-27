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

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 })
  }

  if (!isAllowedPhotoFile(file)) {
    return NextResponse.json({ error: "Only JPEG and PNG images are allowed." }, { status: 400 })
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Each photo must be 5 MB or smaller." }, { status: 400 })
  }

  const filename = uniqueStorageFilename(file.name)
  const path = `admin/team/${filename}`
  const bucket = getListingPhotosBucket()
  const buffer = Buffer.from(await file.arrayBuffer())

  const bucketError = await ensureListingPhotosBucket(supabase)
  if (bucketError) {
    console.error("Team photo bucket setup error:", bucketError)
    return NextResponse.json({ error: storageUploadErrorMessage(bucketError) }, { status: 500 })
  }

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  })

  if (error) {
    console.error("Team photo upload error:", error)
    return NextResponse.json({ error: storageUploadErrorMessage(error) }, { status: 500 })
  }

  const url = getStoragePublicUrl(bucket, path, supabaseUrl)
  return NextResponse.json({ success: true, url })
}
