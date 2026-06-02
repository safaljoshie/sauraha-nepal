import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import {
  getListingPhotosBucket,
  getStoragePublicUrl,
  isAllowedPhotoFile,
  MAX_PHOTO_BYTES,
  photoLimitForPlan,
  sanitizePhotoFilename,
} from "@/lib/list-business-photos"
import { normalizePlan } from "@/lib/list-business"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 500 },
    )
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
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

  const bucket = getListingPhotosBucket()
  const submissionId = randomUUID()
  const urls: string[] = []

  for (const file of files) {
    if (!isAllowedPhotoFile(file)) {
      return NextResponse.json(
        { error: "Only JPEG and PNG images are allowed." },
        { status: 400 },
      )
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 5 MB or smaller." },
        { status: 400 },
      )
    }

    const filename = sanitizePhotoFilename(file.name)
    const path = `pending/${submissionId}/${filename}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    })

    if (error) {
      console.error("Supabase storage upload error:", error)
      return NextResponse.json(
        { error: "Failed to upload photos. Please try again." },
        { status: 500 },
      )
    }

    urls.push(getStoragePublicUrl(bucket, path, supabaseUrl))
  }

  return NextResponse.json({ urls })
}
