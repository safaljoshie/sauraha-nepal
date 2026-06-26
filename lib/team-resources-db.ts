import {
  MAX_RESOURCE_BYTES,
  SIGNED_URL_TTL_SECONDS,
  TEAM_RESOURCES_BUCKET,
  type TeamResource,
  type TeamResourcePayload,
  type TeamResourceWithDownload,
} from "@/lib/team-resources"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function ensureTeamResourcesBucket() {
  const supabase = getSupabaseAdmin()
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    throw new Error(listError.message)
  }

  if (buckets?.some((bucket) => bucket.name === TEAM_RESOURCES_BUCKET)) {
    return
  }

  const { error } = await supabase.storage.createBucket(TEAM_RESOURCES_BUCKET, {
    public: false,
    fileSizeLimit: MAX_RESOURCE_BYTES,
  })

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message)
  }
}

export async function fetchTeamResources() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("team_resources")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TeamResource[]
}

export async function fetchTeamResourceById(id: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("team_resources")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamResource | null
}

export async function createTeamResource(payload: TeamResourcePayload) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("team_resources")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as TeamResource
}

export async function deleteTeamResource(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("team_resources").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadTeamResourceFile(
  path: string,
  buffer: Buffer,
  contentType: string,
) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(TEAM_RESOURCES_BUCKET).upload(path, buffer, {
    contentType: contentType || "application/octet-stream",
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteTeamResourceFile(path: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(TEAM_RESOURCES_BUCKET).remove([path])

  if (error) {
    throw new Error(error.message)
  }
}

export async function createResourceSignedUrl(path: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage
    .from(TEAM_RESOURCES_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create download link.")
  }

  return data.signedUrl
}

export async function attachSignedDownloadUrls(
  resources: TeamResource[],
): Promise<TeamResourceWithDownload[]> {
  return Promise.all(
    resources.map(async (resource) => ({
      ...resource,
      download_url: await createResourceSignedUrl(resource.file_url),
    })),
  )
}
