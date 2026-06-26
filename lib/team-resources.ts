export const TEAM_RESOURCE_CATEGORIES = [
  "Training Guides",
  "Forms & Templates",
  "Brand Assets",
  "Marketing Materials",
  "Policies & Legal",
  "Other",
] as const

export type TeamResourceCategory = (typeof TEAM_RESOURCE_CATEGORIES)[number]

export const TEAM_RESOURCES_BUCKET = "team-resources"
export const MAX_RESOURCE_BYTES = 20 * 1024 * 1024
export const SIGNED_URL_TTL_SECONDS = 60 * 5

export const ALLOWED_RESOURCE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const

export const ALLOWED_RESOURCE_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type TeamResource = {
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

export type TeamResourceWithDownload = TeamResource & {
  download_url: string
}

export type TeamResourcePayload = {
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

export function isAllowedResourceFile(file: { name: string; type: string; size: number }) {
  const ext = getFileExtension(file.name)
  if (!ALLOWED_RESOURCE_EXTENSIONS.includes(ext as (typeof ALLOWED_RESOURCE_EXTENSIONS)[number])) {
    return false
  }

  if (
    file.type &&
    !ALLOWED_RESOURCE_MIME_TYPES.includes(file.type as (typeof ALLOWED_RESOURCE_MIME_TYPES)[number])
  ) {
    return false
  }

  if (file.size > MAX_RESOURCE_BYTES) {
    return false
  }

  return true
}

export function validateResourceUploadInput(input: {
  title?: string
  category?: string
  fileName?: string
  fileType?: string
  fileSize?: number
}) {
  const title = input.title?.trim() ?? ""
  const category = input.category?.trim() ?? ""
  const fileName = input.fileName?.trim() ?? ""

  if (!title) {
    return { error: "Title is required." }
  }

  if (!TEAM_RESOURCE_CATEGORIES.includes(category as TeamResourceCategory)) {
    return { error: "Invalid category." }
  }

  if (!fileName) {
    return { error: "A file is required." }
  }

  const ext = getFileExtension(fileName)
  if (!ALLOWED_RESOURCE_EXTENSIONS.includes(ext as (typeof ALLOWED_RESOURCE_EXTENSIONS)[number])) {
    return {
      error: "Only PDF, Word (.doc/.docx), and image (.jpg/.jpeg/.png/.webp) files are allowed.",
    }
  }

  const fileType = input.fileType?.trim() ?? ""
  if (
    fileType &&
    !ALLOWED_RESOURCE_MIME_TYPES.includes(fileType as (typeof ALLOWED_RESOURCE_MIME_TYPES)[number])
  ) {
    return { error: "Unsupported file type." }
  }

  const fileSize = input.fileSize ?? 0
  if (fileSize <= 0) {
    return { error: "File is empty or missing." }
  }

  if (fileSize > MAX_RESOURCE_BYTES) {
    return { error: "File must be 20 MB or smaller." }
  }

  return { data: { title, category: category as TeamResourceCategory, fileName } }
}

export function sanitizeResourceFilename(filename: string) {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-")
  return base.slice(0, 120) || "file"
}

export function formatResourceFileSize(fileSizeKb: number | null) {
  if (!fileSizeKb || fileSizeKb <= 0) return "—"
  if (fileSizeKb < 1024) return `${fileSizeKb} KB`
  return `${(fileSizeKb / 1024).toFixed(1)} MB`
}

export function formatResourceDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function resourceFileKind(fileType: string, fileName: string): "pdf" | "word" | "image" {
  const lower = `${fileType} ${fileName}`.toLowerCase()
  if (lower.includes("pdf")) return "pdf"
  if (lower.includes("word") || lower.includes("doc")) return "word"
  return "image"
}

export function groupResourcesByCategory<T extends { category: string }>(resources: T[]) {
  const map = new Map<string, T[]>()

  for (const category of TEAM_RESOURCE_CATEGORIES) {
    map.set(category, [])
  }

  for (const resource of resources) {
    const list = map.get(resource.category) ?? []
    list.push(resource)
    map.set(resource.category, list)
  }

  return TEAM_RESOURCE_CATEGORIES.map((category) => ({
    category,
    resources: map.get(category) ?? [],
  })).filter((group) => group.resources.length > 0)
}
