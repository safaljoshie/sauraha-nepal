import imageCompression from "browser-image-compression"

export const MAX_PRE_COMPRESS_BYTES = 15 * 1024 * 1024
export const POST_COMPRESS_WARN_BYTES = 512 * 1024

/** Shared client-side compression before Supabase Storage upload. */
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.75,
} as const

export function webpUploadFilename(originalName: string) {
  const stem = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100)
  return `${stem || "photo"}-${Date.now()}.webp`
}

export async function compressImage(file: File): Promise<File> {
  const options = {
    ...IMAGE_COMPRESSION_OPTIONS,
    fileName: webpUploadFilename(file.name),
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error("Image compression failed:", error)
    throw new Error(
      "Could not optimize this image. Try a smaller JPEG or PNG, or choose a different photo.",
    )
  }
}
