import {
  TEAM_LIBRARY_BUCKET,
  MAX_LIBRARY_FILE_BYTES,
  type TeamLibraryItem,
  type TeamLibraryItemPayload,
  type TeamLibraryItemUpdatePayload,
} from "@/lib/team-library-shared"
import type { TeamLibraryConfig } from "@/lib/team-library-config"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function ensureTeamLibraryBucket() {
  const supabase = getSupabaseAdmin()
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    throw new Error(listError.message)
  }

  if (buckets?.some((bucket) => bucket.name === TEAM_LIBRARY_BUCKET)) {
    return
  }

  const { error } = await supabase.storage.createBucket(TEAM_LIBRARY_BUCKET, {
    public: false,
    fileSizeLimit: MAX_LIBRARY_FILE_BYTES,
  })

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message)
  }
}

export async function fetchTeamLibraryItems(config: Pick<TeamLibraryConfig, "table">) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TeamLibraryItem[]
}

export async function fetchTeamLibraryItemById(
  config: Pick<TeamLibraryConfig, "table">,
  id: string,
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamLibraryItem | null
}

export async function createTeamLibraryItem(
  config: Pick<TeamLibraryConfig, "table">,
  payload: TeamLibraryItemPayload,
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(config.table)
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamLibraryItem
}

export async function updateTeamLibraryItem(
  config: Pick<TeamLibraryConfig, "table">,
  id: string,
  payload: TeamLibraryItemUpdatePayload,
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamLibraryItem
}

export async function deleteTeamLibraryItem(config: Pick<TeamLibraryConfig, "table">, id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from(config.table).delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadTeamLibraryFile(path: string, buffer: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(TEAM_LIBRARY_BUCKET).upload(path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteTeamLibraryFile(path: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(TEAM_LIBRARY_BUCKET).remove([path])

  if (error) {
    throw new Error(error.message)
  }
}
