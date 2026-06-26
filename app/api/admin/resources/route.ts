import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  attachSignedDownloadUrls,
  createTeamResource,
  ensureTeamResourcesBucket,
  fetchTeamResources,
  uploadTeamResourceFile,
} from "@/lib/team-resources-db"
import {
  categorySlug,
  sanitizeResourceFilename,
  validateResourceUploadInput,
} from "@/lib/team-resources"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const resources = await fetchTeamResources()
    const resourcesWithUrls = await attachSignedDownloadUrls(resources)
    return NextResponse.json({ resources: resourcesWithUrls })
  } catch (error) {
    console.error("Admin resources fetch error:", error)
    return NextResponse.json({ error: "Failed to load team resources." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  const file = formData.get("file")
  const title = String(formData.get("title") ?? "")
  const description = String(formData.get("description") ?? "").trim()
  const category = String(formData.get("category") ?? "")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose a file to upload." }, { status: 400 })
  }

  const validated = validateResourceUploadInput({
    title,
    category,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  })

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const safeName = sanitizeResourceFilename(file.name)
  const storagePath = `${categorySlug(validated.data.category)}/${Date.now()}-${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await ensureTeamResourcesBucket()
    await uploadTeamResourceFile(storagePath, buffer, file.type || "application/octet-stream")

    const resource = await createTeamResource({
      title: validated.data.title,
      description: description || null,
      category: validated.data.category,
      file_url: storagePath,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      file_size_kb: Math.max(1, Math.round(file.size / 1024)),
      uploaded_by: "Admin",
    })

    return NextResponse.json({ success: true, resource })
  } catch (error) {
    console.error("Admin resource upload error:", error)
    const message = error instanceof Error ? error.message : "Failed to upload resource."
    const hint =
      message.toLowerCase().includes("bucket not found")
        ? " Create the private 'team-resources' bucket in Supabase Storage, or retry after deploying the latest code."
        : ""
    return NextResponse.json({ error: `${message}${hint}` }, { status: 500 })
  }
}
