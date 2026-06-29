export const TEAM_LIBRARY_BUCKET = "team-resources"
export const MAX_LIBRARY_FILE_BYTES = 20 * 1024 * 1024
export const LIBRARY_SIGNED_URL_TTL_SECONDS = 60 * 5

export const ALLOWED_LIBRARY_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const

export const ALLOWED_LIBRARY_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type TeamLibraryItem = {
  id: string
  created_at: string
  title: string
  description: string | null
  category: string
  file_url: string
  file_name: string
  file_type: string
  file_size_kb: number | null
  uploaded_by: string | null
}

export type TeamLibraryItemWithDownload = TeamLibraryItem

export type TeamLibraryItemPayload = {
  title: string
  description?: string | null
  category: string
  file_url: string
  file_name: string
  file_type: string
  file_size_kb: number
  uploaded_by?: string
}

export function categorySlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getFileExtension(filename: string) {
  const dot = filename.lastIndexOf(".")
  if (dot < 0) return ""
  return filename.slice(dot).toLowerCase()
}

export type LibraryFileDisposition = "inline" | "attachment"

export function resolveLibraryContentType(fileType: string, fileName: string) {
  const mime = fileType.trim().toLowerCase()
  if (mime && mime !== "application/octet-stream") {
    return fileType.trim()
  }

  switch (getFileExtension(fileName)) {
    case ".pdf":
      return "application/pdf"
    case ".png":
      return "image/png"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".webp":
      return "image/webp"
    case ".doc":
      return "application/msword"
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    default:
      return "application/octet-stream"
  }
}

export function isAllowedLibraryFile(file: { name: string; type: string; size: number }) {
  const ext = getFileExtension(file.name)
  if (!ALLOWED_LIBRARY_EXTENSIONS.includes(ext as (typeof ALLOWED_LIBRARY_EXTENSIONS)[number])) {
    return false
  }

  if (
    file.type &&
    !ALLOWED_LIBRARY_MIME_TYPES.includes(file.type as (typeof ALLOWED_LIBRARY_MIME_TYPES)[number])
  ) {
    return false
  }

  if (file.size > MAX_LIBRARY_FILE_BYTES) {
    return false
  }

  return true
}

export function validateLibraryUploadInput(
  categories: readonly string[],
  input: {
    title?: string
    category?: string
    fileName?: string
    fileType?: string
    fileSize?: number
  },
) {
  const title = input.title?.trim() ?? ""
  const category = input.category?.trim() ?? ""
  const fileName = input.fileName?.trim() ?? ""

  if (!title) {
    return { error: "Title is required." }
  }

  if (!categories.includes(category)) {
    return { error: "Invalid category." }
  }

  if (!fileName) {
    return { error: "A file is required." }
  }

  const ext = getFileExtension(fileName)
  if (!ALLOWED_LIBRARY_EXTENSIONS.includes(ext as (typeof ALLOWED_LIBRARY_EXTENSIONS)[number])) {
    return {
      error: "Only PDF, Word (.doc/.docx), and image (.jpg/.jpeg/.png/.webp) files are allowed.",
    }
  }

  const fileType = input.fileType?.trim() ?? ""
  if (
    fileType &&
    !ALLOWED_LIBRARY_MIME_TYPES.includes(fileType as (typeof ALLOWED_LIBRARY_MIME_TYPES)[number])
  ) {
    return { error: "Unsupported file type." }
  }

  const fileSize = input.fileSize ?? 0
  if (fileSize <= 0) {
    return { error: "File is empty or missing." }
  }

  if (fileSize > MAX_LIBRARY_FILE_BYTES) {
    return { error: "File must be 20 MB or smaller." }
  }

  return { data: { title, category, fileName } }
}

export function sanitizeLibraryFilename(filename: string) {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-")
  return base.slice(0, 120) || "file"
}

export function buildLibraryStoragePath(
  storagePrefix: string,
  category: string,
  safeFilename: string,
) {
  const parts = [storagePrefix, categorySlug(category), `${Date.now()}-${safeFilename}`].filter(
    Boolean,
  )
  return parts.join("/")
}

export function formatLibraryFileSize(fileSizeKb: number | null) {
  if (!fileSizeKb || fileSizeKb <= 0) return "—"
  if (fileSizeKb < 1024) return `${fileSizeKb} KB`
  return `${(fileSizeKb / 1024).toFixed(1)} MB`
}

export function formatLibraryDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function libraryFileKind(fileType: string, fileName: string): "pdf" | "word" | "image" {
  const ext = getFileExtension(fileName)
  if (ext === ".pdf") return "pdf"
  if (ext === ".doc" || ext === ".docx") return "word"

  const mime = fileType.toLowerCase()
  if (mime.includes("pdf")) return "pdf"
  if (mime.includes("word") || mime.includes("msword")) return "word"

  return "image"
}

/** All team-library uploads can open in a new tab (PDF/image inline; Word may use the system viewer). */
export function canViewInBrowser(fileType: string, fileName: string) {
  const ext = getFileExtension(fileName)
  if (
    ALLOWED_LIBRARY_EXTENSIONS.includes(ext as (typeof ALLOWED_LIBRARY_EXTENSIONS)[number])
  ) {
    return true
  }

  const kind = libraryFileKind(fileType, fileName)
  return kind === "pdf" || kind === "word" || kind === "image"
}

export function groupLibraryByCategory<T extends { category: string }>(
  categories: readonly string[],
  items: T[],
) {
  const map = new Map<string, T[]>()

  for (const category of categories) {
    map.set(category, [])
  }

  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }

  return categories
    .map((category) => ({
      category,
      items: map.get(category) ?? [],
    }))
    .filter((group) => group.items.length > 0)
}
