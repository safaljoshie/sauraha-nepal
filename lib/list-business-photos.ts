import type { ListingPlan } from "@/lib/list-business"

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export const ALLOWED_PHOTO_MIME = new Set(["image/jpeg", "image/png", "image/webp"])

export const ALLOWED_PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])

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
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
  return base || `photo-${Date.now()}.jpg`
}

export function getStoragePublicUrl(bucket: string, path: string, supabaseUrl: string) {
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`
}
