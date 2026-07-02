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
import { getSupabaseAdmin } from "@/lib/supabase"

export const LISTING_PHOTO_MAX_DIMENSION = 1920
export const LISTING_PHOTO_WEBP_QUALITY = 88

const UTF8_REPLACEMENT_BYTE = 0xef

/** Reject buffers that look like UTF-8-mojibake corrupt binary (common upload bug). */
export function bufferLooksUtf8Corrupted(buffer: Buffer) {
  if (buffer.length < 16) return false
  let replacementCount = 0
  for (let i = 0; i < buffer.length - 2; i++) {
    if (
      buffer[i] === UTF8_REPLACEMENT_BYTE &&
      buffer[i + 1] === 0xbf &&
      buffer[i + 2] === 0xbd
    ) {
      replacementCount++
      if (replacementCount > 8) return true
    }
  }
  return false
}

/** Ensure sharp can decode the buffer; throws if not a valid image. */
export async function assertDecodableImageBuffer(buffer: Buffer) {
  if (buffer.byteLength === 0) {
    throw new Error("Empty image buffer")
  }
  if (bufferLooksUtf8Corrupted(buffer)) {
    throw new Error("Image data appears corrupted")
  }
  await sharp(buffer).metadata()
}

/** Verify uploaded bytes in storage decode (avoids CDN propagation lag on public URLs). */
export async function verifyStoredListingPhoto(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
) {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) {
    throw new Error(error?.message ?? "Could not download uploaded photo from storage")
  }
  const buffer = Buffer.from(await data.arrayBuffer())
  await assertDecodableImageBuffer(buffer)
  return buffer
}

/** Verify a public storage URL returns a decodable image (integrity checks / external use). */
export async function verifyPublicListingPhotoUrl(url: string, retries = 4) {
  let lastError: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Storage URL returned HTTP ${res.status}`)
      }
      const buffer = Buffer.from(await res.arrayBuffer())
      await assertDecodableImageBuffer(buffer)
      return buffer
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Photo verification failed")
}

/** Server-side compression — same settings as client + bulk migration scripts. */
export async function compressListingPhotoBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(LISTING_PHOTO_MAX_DIMENSION, LISTING_PHOTO_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: LISTING_PHOTO_WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
    })
    .toBuffer()
}

function sanitizeListingFolderId(listingId: string) {
  const trimmed = listingId.trim().replace(/[^a-zA-Z0-9-]/g, "")
  return trimmed || randomUUID()
}

/** Supabase storage must receive Blob/FormData on serverless — raw Buffer can UTF-8-corrupt. */
function listingPhotoUploadBody(buffer: Buffer): Blob {
  return new Blob([Uint8Array.from(buffer)], { type: "image/webp" })
}

export function buildCompressedListingPhotoPath(listingId: string, fileName?: string) {
  const safeId = sanitizeListingFolderId(listingId)
  const name = fileName?.trim() || `${Date.now()}-${randomUUID().slice(0, 8)}.webp`
  return `compressed/${safeId}/${name}`
}

export function isCompressedListingPhotoPath(path: string) {
  return path.startsWith("compressed/")
}

export function isLegacyUncompressedListingPhotoUrl(url: string) {
  try {
    const pathname = new URL(url).pathname
    return pathname.includes("/pending/") || pathname.includes("/admin/")
  } catch {
    return false
  }
}

export function isAlreadyCompressedListingPhotoUrl(url: string) {
  try {
    return new URL(url).pathname.includes("/compressed/")
  } catch {
    return false
  }
}

export type UploadListingPhotoResult =
  | { ok: true; url: string; bytes: number; path: string }
  | { ok: false; error: string }

type UploadListingPhotoOptions = {
  supabase?: SupabaseClient
  supabaseUrl?: string
  originalSize?: number
  /** When set (bulk migration), upload to this exact path instead of generating a new one. */
  storagePath?: string
  upsert?: boolean
}

/**
 * Single pipeline for business listing photos in the listing photos bucket.
 * Always compresses to WebP and stores under compressed/{listingId}/.
 *
 * `listingId` may be a Supabase listing UUID (admin edits) or a client
 * submission UUID (public form before the row exists).
 */
export async function uploadListingPhoto(
  fileBuffer: Buffer,
  listingId: string,
  options: UploadListingPhotoOptions = {},
): Promise<UploadListingPhotoResult> {
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
    compressed = await compressListingPhotoBuffer(fileBuffer)
    await assertDecodableImageBuffer(compressed)
  } catch (error) {
    console.error("Listing photo compression failed:", error)
    return {
      ok: false,
      error: "Could not optimize this image. Try a smaller JPEG or PNG, or choose a different photo.",
    }
  }

  const path =
    options.storagePath?.trim() ||
    buildCompressedListingPhotoPath(listingId)

  if (!isCompressedListingPhotoPath(path)) {
    return { ok: false, error: "Listing photos must be stored under compressed/." }
  }

  const { error: uploadError } = await supabase.storage.from(bucket).upload(
    path,
    listingPhotoUploadBody(compressed),
    {
      contentType: "image/webp",
      upsert: options.upsert ?? false,
    },
  )

  if (uploadError) {
    return { ok: false, error: storageUploadErrorMessage(uploadError) }
  }

  const url = getStoragePublicUrl(bucket, path, supabaseUrl)

  try {
    await verifyStoredListingPhoto(supabase, bucket, path)
  } catch (error) {
    console.error("Post-upload photo verification failed:", error)
    await supabase.storage.from(bucket).remove([path]).catch(() => undefined)
    return {
      ok: false,
      error:
        "Photo uploaded but failed verification. Please try again with a JPEG or PNG photo.",
    }
  }

  return { ok: true, url, bytes: compressed.byteLength, path }
}
