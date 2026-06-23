/** Default next/image quality — near-lossless at smaller file sizes. */
export const DEFAULT_IMAGE_QUALITY = 80

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
