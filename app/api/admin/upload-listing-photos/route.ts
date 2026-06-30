import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { isAllowedPhotoFile } from "@/lib/list-business-photos"
import { getSupabaseAdmin } from "@/lib/supabase"
import { uploadListingPhoto } from "@/lib/upload-listing-photo"

function revalidateListingPages(listingId: string) {
  revalidatePath("/listings")
  revalidatePath(`/listings/${listingId}`)
}

function appendPhotoLinks(existingLinks: string, uploadedUrls: string[]) {
  const existing = existingLinks
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const seen = new Set(existing)
  const appended = [...existing]
  for (const url of uploadedUrls) {
    if (!seen.has(url)) {
      appended.push(url)
      seen.add(url)
    }
  }
  return appended.join("\n")
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

  const { data: existing, error: existingError } = await supabase
    .from("business_listings")
    .select("id, photo_links")
    .eq("id", listingId)
    .maybeSingle()

  if (existingError) {
    console.error("Listing lookup error:", existingError)
    return NextResponse.json({ error: "Failed to load listing." }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 })
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
      supabase,
      supabaseUrl,
      originalSize: file.size,
    })

    if (!result.ok) {
      console.error("Admin listing photo upload error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    urls.push(result.url)
  }

  const photo_links = appendPhotoLinks(existing.photo_links ?? "", urls)

  const { error: updateError } = await supabase
    .from("business_listings")
    .update({ photo_links })
    .eq("id", listingId)

  if (updateError) {
    console.error("Failed to save photo_links after upload:", updateError)
    return NextResponse.json(
      {
        error:
          "Photos uploaded to storage but failed to save to the listing. Copy the URLs from storage or try again.",
        urls,
      },
      { status: 500 },
    )
  }

  revalidateListingPages(listingId)

  return NextResponse.json({ urls, photo_links })
}
