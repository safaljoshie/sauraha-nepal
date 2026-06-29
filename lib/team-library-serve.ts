import type { TeamLibraryConfig } from "@/lib/team-library-config"
import type { LibraryFileDisposition } from "@/lib/team-library-shared"
import { fetchTeamLibraryItemById } from "@/lib/team-library-db"
import { TEAM_LIBRARY_BUCKET, resolveLibraryContentType } from "@/lib/team-library-shared"
import { getSupabaseAdmin } from "@/lib/supabase"

function escapeContentDispositionFilename(filename: string) {
  const safe = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_")
  return safe || "file"
}

export async function serveTeamLibraryFile(
  config: Pick<TeamLibraryConfig, "table">,
  id: string,
  disposition: LibraryFileDisposition,
): Promise<Response> {
  const item = await fetchTeamLibraryItemById(config, id)
  if (!item) {
    return new Response("File not found.", { status: 404 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage.from(TEAM_LIBRARY_BUCKET).download(item.file_url)

  if (error || !data) {
    console.error("Team library file download error:", error)
    return new Response("Failed to load file.", { status: 500 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  const contentType = resolveLibraryContentType(item.file_type, item.file_name)
  const filename = escapeContentDispositionFilename(item.file_name)
  const contentDisposition =
    disposition === "attachment"
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

export function teamLibraryViewPath(config: Pick<TeamLibraryConfig, "teamApiPath">, id: string) {
  return `${config.teamApiPath}/${encodeURIComponent(id)}/view`
}

export function teamLibraryDownloadPath(
  config: Pick<TeamLibraryConfig, "teamApiPath">,
  id: string,
) {
  return `${config.teamApiPath}/${encodeURIComponent(id)}/download`
}
