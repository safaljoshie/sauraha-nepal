/**
 * Default next/image quality. Must be listed in `images.qualities` in
 * next.config.ts — the optimizer 400s on any value not declared there.
 */
export const DEFAULT_IMAGE_QUALITY = 75

export function isNextOptimizedImageSrc(src: string) {
  const trimmed = src.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("/")) return true
  if (trimmed.includes("images.unsplash.com")) return true
  if (trimmed.includes(".supabase.co")) return true
  return false
}

export function formatImageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
