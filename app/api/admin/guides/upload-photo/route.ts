import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminApi } from "@/lib/admin-auth"
import { uploadGuidePhoto } from "@/lib/upload-guide-photo"
import { buildGuideProfilePath } from "@/lib/tour-guides"
import { getSupabaseAdmin } from "@/lib/supabase"

const MAX_FILES = 1

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 })
  }

  const guideId = String(formData.get("guideId") ?? "").trim()
  if (!guideId) {
    return NextResponse.json({ error: "Guide ID is required." }, { status: 400 })
  }

  const files = formData.getAll("file").filter((entry): entry is File => entry instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: "No photo file provided." }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "Upload one photo at a time." }, { status: 400 })
  }

  const file = files[0]
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const supabase = getSupabaseAdmin()
    const result = await uploadGuidePhoto(buffer, guideId, {
      supabase,
      originalSize: file.size,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("tour_guides")
      .select("id, status")
      .eq("id", guideId)
      .maybeSingle()

    if (existing) {
      const { error: updateError } = await supabase
        .from("tour_guides")
        .update({
          photo_url: result.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guideId)

      if (updateError) {
        console.error("Guide photo_url update error:", updateError)
        return NextResponse.json(
          { error: "Photo uploaded but could not be linked to the guide profile." },
          { status: 500 },
        )
      }

      if (existing.status === "approved") {
        revalidatePath("/guides")
        revalidatePath(buildGuideProfilePath({ id: guideId }))
      }
    }

    return NextResponse.json({ success: true, url: result.url, bytes: result.bytes, saved: Boolean(existing) })
  } catch (error) {
    console.error("POST /api/admin/guides/upload-photo error:", error)
    return NextResponse.json({ error: "Upload failed." }, { status: 500 })
  }
}
