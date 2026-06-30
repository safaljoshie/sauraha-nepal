import { NextResponse } from "next/server"
import {
  isAllowedPhotoFile,
  photoLimitForPlan,
} from "@/lib/list-business-photos"
import { normalizePlan } from "@/lib/list-business"
import { uploadListingPhoto } from "@/lib/upload-listing-photo"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 500 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  const planParam = formData.get("plan")
  const plan =
    typeof planParam === "string" ? normalizePlan(planParam) : null
  if (!plan) {
    return NextResponse.json({ error: "Invalid listing plan." }, { status: 400 })
  }

  const existingCountRaw = formData.get("existingCount")
  const existingCount =
    typeof existingCountRaw === "string" ? Number.parseInt(existingCountRaw, 10) : 0
  const safeExisting = Number.isFinite(existingCount) ? Math.max(0, existingCount) : 0

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ urls: [] })
  }

  const limit = photoLimitForPlan(plan)
  if (safeExisting + files.length > limit) {
    return NextResponse.json(
      {
        error: `You can add at most ${limit} photo${limit === 1 ? "" : "s"} on the ${plan} plan.`,
      },
      { status: 400 },
    )
  }

  const submissionIdRaw = formData.get("submissionId")
  const listingFolderId =
    typeof submissionIdRaw === "string" && submissionIdRaw.trim()
      ? submissionIdRaw.trim().replace(/[^a-zA-Z0-9-]/g, "")
      : randomUUID()

  const urls: string[] = []

  for (const file of files) {
    if (!isAllowedPhotoFile(file)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP, and HEIC images are allowed." },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadListingPhoto(buffer, listingFolderId, {
      supabaseUrl,
      originalSize: file.size,
    })

    if (!result.ok) {
      console.error("Listing photo upload error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    urls.push(result.url)
  }

  return NextResponse.json({ urls })
}
