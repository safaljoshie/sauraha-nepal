import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import type { ListingPlan } from "@/lib/list-business"

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024

/** Same bucket hosts listing photos and hero media — allow the larger hero video cap. */
export const LISTING_BUCKET_FILE_SIZE_LIMIT = 50 * 1024 * 1024

export const LISTING_BUCKET_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
] as const

export const ALLOWED_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

export const ALLOWED_PHOTO_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
])

export function getListingPhotosBucket() {
  return (
    process.env.SUPABASE_LISTING_PHOTOS_BUCKET?.trim() ||
    "Sauraha Nepal Listing uploads"
  )
}

export function photoLimitForPlan(plan: ListingPlan) {
  switch (plan) {
    case "basic":
      return 1
    case "featured":
      return 10
    case "premium":
      return 20
  }
}

export function parsePhotoLinkLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function mergePhotoLinks(uploadedUrls: string[], linkText: string) {
  const fromText = parsePhotoLinkLines(linkText)
  const seen = new Set<string>()
  const merged: string[] = []

  for (const url of [...uploadedUrls, ...fromText]) {
    const normalized = url.trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    merged.push(normalized)
  }

  return merged.join("\n")
}

export function isAllowedPhotoFile(file: File) {
  if (ALLOWED_PHOTO_MIME.has(file.type)) return true
  const lower = file.name.toLowerCase()
  return [...ALLOWED_PHOTO_EXTENSIONS].some((ext) => lower.endsWith(ext))
}

export function sanitizePhotoFilename(name: string) {
  const stem = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100)
  const lower = name.toLowerCase()
  if (lower.endsWith(".webp")) {
    return `${stem || `photo-${Date.now()}`}.webp`
  }
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
  return base || `photo-${Date.now()}.jpg`
}

/** Avoid duplicate-path upload failures when re-uploading to the same folder. */
export function uniqueStorageFilename(name: string) {
  const base = sanitizePhotoFilename(name)
  const dot = base.lastIndexOf(".")
  const ext = dot >= 0 ? base.slice(dot) : ".jpg"
  const stem = dot >= 0 ? base.slice(0, dot) : base
  return `${stem}-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
}

export function storageUploadErrorMessage(error: { message?: string }) {
  const msg = (error.message ?? "").toLowerCase()
  if (msg.includes("bucket not found")) {
    return 'Photo storage bucket is missing. Create "Sauraha Nepal Listing uploads" in Supabase Storage.'
  }
  if (msg.includes("already exists") || msg.includes("duplicate")) {
    return "This file already exists. Please try uploading again."
  }
  if (msg.includes("mime") || msg.includes("content type") || msg.includes("invalid file type")) {
    return "This image type is not allowed. Use JPEG, PNG, WEBP, or HEIC."
  }
  if (msg.includes("too large") || msg.includes("payload") || msg.includes("exceeded")) {
    return "Image is too large for storage limits (max 15 MB per photo)."
  }
  if (msg.includes("row-level security") || msg.includes("policy")) {
    return "Storage permission error. Check Supabase bucket policies for the service role."
  }
  return error.message?.trim() || "Failed to upload image. Please try again."
}

export async function ensureListingPhotosBucket(supabase: SupabaseClient) {
  const bucket = getListingPhotosBucket()
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error("Listing photos listBuckets error:", listError)
  }

  const exists = buckets?.some((entry) => entry.name === bucket)

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: LISTING_BUCKET_FILE_SIZE_LIMIT,
      allowedMimeTypes: [...LISTING_BUCKET_ALLOWED_MIME],
    })
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      return createError
    }
    return null
  }

  const { error: updateError } = await supabase.storage.updateBucket(bucket, {
    public: true,
    fileSizeLimit: LISTING_BUCKET_FILE_SIZE_LIMIT,
    allowedMimeTypes: [...LISTING_BUCKET_ALLOWED_MIME],
  })
  if (updateError) {
    console.warn("Listing photos updateBucket warning:", updateError)
  }

  return null
}

export function getStoragePublicUrl(bucket: string, path: string, supabaseUrl: string) {
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`
}
