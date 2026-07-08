import { randomUUID } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import sharp from "sharp"
import {
  ensureListingPhotosBucket,
  getListingPhotosBucket,
  getStoragePublicUrl,
  MAX_PHOTO_BYTES,
  storageUploadErrorMessage,
} from "@/lib/list-business-photos"
import {
  assertDecodableImageBuffer,
  verifyStoredListingPhoto,
} from "@/lib/upload-listing-photo"
import { getSupabaseAdmin } from "@/lib/supabase"

export const GUIDE_PHOTO_MAX_DIMENSION = 1280
export const GUIDE_PHOTO_WEBP_QUALITY = 75

function sanitizeGuideFolderId(guideId: string) {
  const trimmed = guideId.trim().replace(/[^a-zA-Z0-9-]/g, "")
  return trimmed || randomUUID()
}

function guidePhotoUploadBody(buffer: Buffer): Blob {
  return new Blob([Uint8Array.from(buffer)], { type: "image/webp" })
}

export function buildGuidePhotoPath(guideId: string, fileName?: string) {
  const safeId = sanitizeGuideFolderId(guideId)
  const name = fileName?.trim() || `${Date.now()}-${randomUUID().slice(0, 8)}.webp`
  return `guide-photos/${safeId}/${name}`
}

async function compressGuidePhotoBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(GUIDE_PHOTO_MAX_DIMENSION, GUIDE_PHOTO_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: GUIDE_PHOTO_WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
    })
    .toBuffer()
}

export type UploadGuidePhotoResult =
  | { ok: true; url: string; bytes: number; path: string }
  | { ok: false; error: string }

type UploadGuidePhotoOptions = {
  supabase?: SupabaseClient
  supabaseUrl?: string
  originalSize?: number
}

export async function uploadGuidePhoto(
  fileBuffer: Buffer,
  guideId: string,
  options: UploadGuidePhotoOptions = {},
): Promise<UploadGuidePhotoResult> {
  const originalSize = options.originalSize ?? fileBuffer.byteLength
  if (originalSize > MAX_PHOTO_BYTES) {
    return { ok: false, error: "File too large. Please choose a photo under 15MB." }
  }

  const supabaseUrl = options.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!supabaseUrl) {
    return { ok: false, error: "Storage is not configured." }
  }

  let supabase = options.supabase
  if (!supabase) {
    try {
      supabase = getSupabaseAdmin()
    } catch {
      return { ok: false, error: "Storage is not configured." }
    }
  }

  const bucket = getListingPhotosBucket()
  const bucketError = await ensureListingPhotosBucket(supabase)
  if (bucketError) {
    return { ok: false, error: storageUploadErrorMessage(bucketError) }
  }

  let compressed: Buffer
  try {
    await assertDecodableImageBuffer(fileBuffer)
    compressed = await compressGuidePhotoBuffer(fileBuffer)
    await assertDecodableImageBuffer(compressed)
  } catch (error) {
    console.error("Guide photo compression failed:", error)
    return {
      ok: false,
      error: "Could not optimize this image. Try a smaller JPEG or PNG, or choose a different photo.",
    }
  }

  const path = buildGuidePhotoPath(guideId)

  const { error: uploadError } = await supabase.storage.from(bucket).upload(
    path,
    guidePhotoUploadBody(compressed),
    { contentType: "image/webp", upsert: false },
  )

  if (uploadError) {
    return { ok: false, error: storageUploadErrorMessage(uploadError) }
  }

  const url = getStoragePublicUrl(bucket, path, supabaseUrl)

  try {
    await verifyStoredListingPhoto(supabase, bucket, path)
  } catch (error) {
    console.error("Post-upload guide photo verification failed:", error)
    await supabase.storage.from(bucket).remove([path]).catch(() => undefined)
    return {
      ok: false,
      error: "Photo uploaded but failed verification. Please try again.",
    }
  }

  return { ok: true, url, bytes: compressed.byteLength, path }
}
