import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { requireTeamOrAdminApi } from "@/lib/calendar-access"
import type { TeamLibraryConfig } from "@/lib/team-library-config"
import {
  createTeamLibraryItem,
  deleteTeamLibraryFile,
  deleteTeamLibraryItem,
  ensureTeamLibraryBucket,
  fetchTeamLibraryItemById,
  fetchTeamLibraryItems,
  uploadTeamLibraryFile,
} from "@/lib/team-library-db"
import {
  buildLibraryStoragePath,
  resolveLibraryContentType,
  sanitizeLibraryFilename,
  validateLibraryUploadInput,
} from "@/lib/team-library-shared"
import { serveTeamLibraryFile } from "@/lib/team-library-serve"

function bucketHint(message: string) {
  return message.toLowerCase().includes("bucket not found")
    ? " Create the private 'team-resources' bucket in Supabase Storage, or retry after deploying the latest code."
    : ""
}

export function createAdminLibraryGET(config: TeamLibraryConfig) {
  return async function GET() {
    const unauthorized = await requireAdminApi()
    if (unauthorized) return unauthorized

    try {
      const items = await fetchTeamLibraryItems(config)
      return NextResponse.json({ resources: items })
    } catch (error) {
      console.error(`Admin ${config.id} fetch error:`, error)
      return NextResponse.json({ error: config.loadErrorMessage }, { status: 500 })
    }
  }
}

export function createAdminLibraryPOST(config: TeamLibraryConfig) {
  return async function POST(request: Request) {
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

    const validated = validateLibraryUploadInput(config.categories, {
      title,
      category,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const safeName = sanitizeLibraryFilename(file.name)
    const storagePath = buildLibraryStoragePath(
      config.storagePrefix,
      validated.data.category,
      safeName,
    )
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      await ensureTeamLibraryBucket()
      await uploadTeamLibraryFile(
        storagePath,
        buffer,
        resolveLibraryContentType(file.type || "", file.name),
      )

      const resource = await createTeamLibraryItem(config, {
        title: validated.data.title,
        description: description || null,
        category: validated.data.category,
        file_url: storagePath,
        file_name: file.name,
        file_type: resolveLibraryContentType(file.type || "", file.name),
        file_size_kb: Math.max(1, Math.round(file.size / 1024)),
        uploaded_by: "Admin",
      })

      return NextResponse.json({ success: true, resource })
    } catch (error) {
      console.error(`Admin ${config.id} upload error:`, error)
      const message = error instanceof Error ? error.message : "Failed to upload file."
      return NextResponse.json({ error: `${message}${bucketHint(message)}` }, { status: 500 })
    }
  }
}

export function createAdminLibraryDELETE(config: TeamLibraryConfig) {
  return async function DELETE(
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const unauthorized = await requireAdminApi()
    if (unauthorized) return unauthorized

    const { id } = await context.params

    try {
      const item = await fetchTeamLibraryItemById(config, id)
      if (!item) {
        return NextResponse.json({ error: "File not found." }, { status: 404 })
      }

      await deleteTeamLibraryFile(item.file_url)
      await deleteTeamLibraryItem(config, id)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(`Admin ${config.id} delete error:`, error)
      return NextResponse.json({ error: "Failed to delete file." }, { status: 500 })
    }
  }
}

export function createTeamLibraryGET(config: TeamLibraryConfig) {
  return async function GET() {
    const unauthorized = await requireTeamOrAdminApi()
    if (unauthorized) return unauthorized

    try {
      const items = await fetchTeamLibraryItems(config)
      return NextResponse.json({ resources: items })
    } catch (error) {
      console.error(`Team ${config.id} fetch error:`, error)
      return NextResponse.json({ error: config.loadErrorMessage }, { status: 500 })
    }
  }
}

export function createTeamLibraryMethodNotAllowed() {
  return async function methodNotAllowed() {
    const unauthorized = await requireTeamOrAdminApi()
    if (unauthorized) return unauthorized
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }
}

export function createTeamLibraryFileRoute(
  config: TeamLibraryConfig,
  disposition: "inline" | "attachment",
) {
  return async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const unauthorized = await requireTeamOrAdminApi()
    if (unauthorized) return unauthorized

    const { id } = await context.params
    try {
      return await serveTeamLibraryFile(config, id, disposition)
    } catch (error) {
      console.error(`Team ${config.id} file serve error:`, error)
      return new Response("Failed to load file.", { status: 500 })
    }
  }
}
