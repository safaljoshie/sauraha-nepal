import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import {
  deleteTeamResource,
  deleteTeamResourceFile,
  fetchTeamResourceById,
} from "@/lib/team-resources-db"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const resource = await fetchTeamResourceById(id)
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    await deleteTeamResourceFile(resource.file_url)
    await deleteTeamResource(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin resource delete error:", error)
    return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 })
  }
}
