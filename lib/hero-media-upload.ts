import { randomUUID } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  ensureListingPhotosBucket,
  getListingPhotosBucket,
  getStoragePublicUrl,
} from "@/lib/list-business-photos"

export const MAX_HERO_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_HERO_VIDEO_BYTES = 50 * 1024 * 1024

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/mp4",
  "application/octet-stream",
])

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm"] as const

export type HeroMediaUploadType = "image" | "video"

export function getHeroUploadFolder(type: HeroMediaUploadType) {
  return `admin/site/hero/${type}/${randomUUID()}`
}

function extensionFromName(name: string) {
  const lower = name.toLowerCase()
  const dot = lower.lastIndexOf(".")
  if (dot < 0) return ""
  return lower.slice(dot)
}

export function resolveHeroContentType(
  type: HeroMediaUploadType,
  file: Pick<File, "name" | "type">,
) {
  const mime = file.type?.trim().toLowerCase()
  if (mime) {
    if (type === "video" && (ALLOWED_VIDEO_MIME.has(mime) || mime.startsWith("video/"))) {
      if (mime === "video/quicktime") return "video/mp4"
      return mime
    }
    if (type === "image" && ALLOWED_IMAGE_MIME.has(mime)) return mime
  }

  const ext = extensionFromName(file.name)
  if (type === "video") {
    if (ext === ".webm") return "video/webm"
    if (ext === ".mp4" || ext === ".mov") return "video/mp4"
  }
  if (type === "image") {
    if (ext === ".png") return "image/png"
    if (ext === ".webp") return "image/webp"
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  }
  return null
}

export function isAllowedHeroFile(
  type: HeroMediaUploadType,
  file: Pick<File, "name" | "type" | "size">,
) {
  if (resolveHeroContentType(type, file)) {
    const max = type === "video" ? MAX_HERO_VIDEO_BYTES : MAX_HERO_IMAGE_BYTES
    if (file.size > max) {
      return {
        ok: false as const,
        error:
          type === "video"
            ? "Video must be 50 MB or smaller."
            : "Image must be 10 MB or smaller.",
      }
    }
    return { ok: true as const }
  }

  const ext = extensionFromName(file.name)
  const allowed =
    type === "video" ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS
  if (!allowed.some((suffix) => ext === suffix)) {
    return {
      ok: false as const,
      error:
        type === "video"
          ? "Only MP4 and WEBM videos are allowed."
          : "Only JPEG, PNG, and WEBP images are allowed.",
    }
  }

  const max = type === "video" ? MAX_HERO_VIDEO_BYTES : MAX_HERO_IMAGE_BYTES
  if (file.size > max) {
    return {
      ok: false as const,
      error:
        type === "video"
          ? "Video must be 50 MB or smaller."
          : "Image must be 10 MB or smaller.",
    }
  }

  return { ok: true as const }
}

export function sanitizeHeroFilename(name: string, type: HeroMediaUploadType) {
  const ext = extensionFromName(name)
  const allowed: readonly string[] =
    type === "video" ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS
  const safeExt = allowed.includes(ext)
    ? ext
    : type === "video"
      ? ".mp4"
      : ".jpg"

  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100)

  return `${base || `hero-${Date.now()}`}${safeExt}`
}

export function buildHeroStoragePath(type: HeroMediaUploadType, filename: string) {
  const folder = getHeroUploadFolder(type)
  const safeName = sanitizeHeroFilename(filename, type)
  return `${folder}/${safeName}`
}

export function getHeroPublicUrl(path: string, supabaseUrl: string) {
  return getStoragePublicUrl(getListingPhotosBucket(), path, supabaseUrl)
}

/** MIME types allowed on the shared listing photos bucket (images + hero video). */
export const HERO_BUCKET_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
] as const

/**
 * Listing photo bucket defaults to ~5MB image-only limits. Hero videos need more.
 * Best-effort update via service role before signed uploads.
 */
export async function ensureHeroStorageBucket(supabase: SupabaseClient, _bucket?: string) {
  return ensureListingPhotosBucket(supabase)
}
