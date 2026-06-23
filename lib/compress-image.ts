import imageCompression from "browser-image-compression"

export const MAX_PRE_COMPRESS_BYTES = 15 * 1024 * 1024
export const POST_COMPRESS_WARN_BYTES = 2 * 1024 * 1024

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.8,
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
    ...COMPRESSION_OPTIONS,
    fileName: webpUploadFilename(file.name),
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error("Image compression failed, uploading original", error)
    return file
  }
}
