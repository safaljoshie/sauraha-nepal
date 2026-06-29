import { RESOURCE_LIBRARY_CONFIG } from "@/lib/team-library-config"
import { createAdminLibraryDELETE, createAdminLibraryPUT } from "@/lib/team-library-handlers"

export const PUT = createAdminLibraryPUT(RESOURCE_LIBRARY_CONFIG)
export const DELETE = createAdminLibraryDELETE(RESOURCE_LIBRARY_CONFIG)
