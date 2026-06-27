import { randomUUID } from "crypto"
import {
  ensureListingPhotosBucket,
  getListingPhotosBucket,
  getStoragePublicUrl,
} from "@/lib/list-business-photos"
import { getSupabaseAdmin } from "@/lib/supabase"

export type BlogImagePurpose = "cover" | "inline"

const MAX_BYTES = 10 * 1024 * 1024

export function blogImageFolder(purpose: BlogImagePurpose, postId?: string) {
  const id = postId?.trim() || randomUUID()
  return purpose === "cover"
    ? `admin/site/blog/covers/${id}`
    : `admin/site/blog/content/${id}`
}

export async function uploadBlogImage(params: {
  buffer: Buffer
  contentType: string
  filename: string
  postId?: string
  purpose: BlogImagePurpose
}): Promise<{ url: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("Storage is not configured.")
  }

  if (params.buffer.length > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.")
  }

  const supabase = getSupabaseAdmin()
  const bucketError = await ensureListingPhotosBucket(supabase)
  if (bucketError) {
    throw bucketError
  }

  const path = `${blogImageFolder(params.purpose, params.postId)}/${params.filename}`
  const bucket = getListingPhotosBucket()

  const { error } = await supabase.storage.from(bucket).upload(path, params.buffer, {
    contentType: params.contentType || "image/jpeg",
    upsert: false,
  })

  if (error) {
    throw error
  }

  return { url: getStoragePublicUrl(bucket, path, supabaseUrl) }
}

export const BLOG_IMAGE_MAX_BYTES = MAX_BYTES
