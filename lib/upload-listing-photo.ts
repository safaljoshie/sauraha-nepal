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

export const LISTING_PHOTO_MAX_DIMENSION = 1280
export const LISTING_PHOTO_WEBP_QUALITY = 75

/** Server-side compression — same settings as client + bulk migration scripts. */
export async function compressListingPhotoBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(LISTING_PHOTO_MAX_DIMENSION, LISTING_PHOTO_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: LISTING_PHOTO_WEBP_QUALITY })
    .toBuffer()
}

function sanitizeListingFolderId(listingId: string) {
  const trimmed = listingId.trim().replace(/[^a-zA-Z0-9-]/g, "")
  return trimmed || randomUUID()
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
    compressed = await compressListingPhotoBuffer(fileBuffer)
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

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, compressed, {
    contentType: "image/webp",
    upsert: options.upsert ?? false,
  })

  if (uploadError) {
    return { ok: false, error: storageUploadErrorMessage(uploadError) }
  }

  const url = getStoragePublicUrl(bucket, path, supabaseUrl)
  return { ok: true, url, bytes: compressed.byteLength, path }
}
