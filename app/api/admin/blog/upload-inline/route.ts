import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { uploadBlogImage } from "@/lib/blog-image-upload"
import { isAllowedPhotoFile, uniqueStorageFilename } from "@/lib/list-business-photos"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

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

  const rawPostId = formData.get("postId")
  const postId = typeof rawPostId === "string" && rawPostId.trim() ? rawPostId.trim() : undefined

  try {
    const { url } = await uploadBlogImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "image/jpeg",
      filename: uniqueStorageFilename(file.name),
      postId,
      purpose: "inline",
    })
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Blog inline image upload error:", error)
    const message = error instanceof Error ? error.message : "Failed to upload image."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
