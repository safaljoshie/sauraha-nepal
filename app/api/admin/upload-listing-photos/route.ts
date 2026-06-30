import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { isAllowedPhotoFile } from "@/lib/list-business-photos"
import { uploadListingPhoto } from "@/lib/upload-listing-photo"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
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

  const listingIdRaw = formData.get("listingId")
  const listingId =
    typeof listingIdRaw === "string" && listingIdRaw.trim()
      ? listingIdRaw.trim().replace(/[^a-zA-Z0-9-]/g, "")
      : ""

  if (!listingId) {
    return NextResponse.json({ error: "Listing id is required for photo upload." }, { status: 400 })
  }

  const urls: string[] = []

  for (const file of files) {
    if (!isAllowedPhotoFile(file)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP, and HEIC images are allowed." },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadListingPhoto(buffer, listingId, {
      supabaseUrl,
      originalSize: file.size,
    })

    if (!result.ok) {
      console.error("Admin listing photo upload error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    urls.push(result.url)
  }

  return NextResponse.json({ urls })
}
