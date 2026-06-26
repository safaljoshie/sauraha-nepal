import { RESOURCE_LIBRARY_CATEGORIES } from "@/lib/team-library-config"
import {
  groupLibraryByCategory,
  validateLibraryUploadInput,
  type TeamLibraryItem,
  type TeamLibraryItemPayload,
  type TeamLibraryItemWithDownload,
} from "@/lib/team-library-shared"

export {
  ALLOWED_LIBRARY_EXTENSIONS as ALLOWED_RESOURCE_EXTENSIONS,
  ALLOWED_LIBRARY_MIME_TYPES as ALLOWED_RESOURCE_MIME_TYPES,
  TEAM_LIBRARY_BUCKET as TEAM_RESOURCES_BUCKET,
  MAX_LIBRARY_FILE_BYTES as MAX_RESOURCE_BYTES,
  LIBRARY_SIGNED_URL_TTL_SECONDS as SIGNED_URL_TTL_SECONDS,
  categorySlug,
  getFileExtension,
  isAllowedLibraryFile as isAllowedResourceFile,
  sanitizeLibraryFilename as sanitizeResourceFilename,
  formatLibraryFileSize as formatResourceFileSize,
  formatLibraryDate as formatResourceDate,
  libraryFileKind as resourceFileKind,
} from "@/lib/team-library-shared"

export { RESOURCE_LIBRARY_CATEGORIES as TEAM_RESOURCE_CATEGORIES }

export type TeamResourceCategory = (typeof RESOURCE_LIBRARY_CATEGORIES)[number]
export type TeamResource = TeamLibraryItem
export type TeamResourceWithDownload = TeamLibraryItemWithDownload
export type TeamResourcePayload = TeamLibraryItemPayload

export function validateResourceUploadInput(
  input: Parameters<typeof validateLibraryUploadInput>[1],
) {
  return validateLibraryUploadInput(RESOURCE_LIBRARY_CATEGORIES, input)
}

export function groupResourcesByCategory<T extends { category: string }>(resources: T[]) {
  return groupLibraryByCategory(RESOURCE_LIBRARY_CATEGORIES, resources).map((group) => ({
    category: group.category,
    resources: group.items,
  }))
}
