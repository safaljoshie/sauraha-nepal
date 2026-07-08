import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { isAllowedPhotoFile } from "@/lib/list-business-photos"
import { uploadGuidePhoto } from "@/lib/upload-guide-photo"

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

  const submissionIdRaw = formData.get("submissionId")
  const submissionId =
    typeof submissionIdRaw === "string" && submissionIdRaw.trim()
      ? submissionIdRaw.trim()
      : randomUUID()

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ urls: [] })
  }

  if (files.length > 1) {
    return NextResponse.json(
      { error: "Please upload one profile photo at a time." },
      { status: 400 },
    )
  }

  const file = files[0]
  if (!isAllowedPhotoFile(file)) {
    return NextResponse.json(
      { error: "Please upload a JPEG, PNG, or WebP image." },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadGuidePhoto(buffer, submissionId, { originalSize: file.size })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ urls: [result.url], submissionId })
}
