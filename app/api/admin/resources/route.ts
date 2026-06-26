import { RESOURCE_LIBRARY_CONFIG } from "@/lib/team-library-config"
import {
  createAdminLibraryDELETE,
  createAdminLibraryGET,
  createAdminLibraryPOST,
} from "@/lib/team-library-handlers"

export const GET = createAdminLibraryGET(RESOURCE_LIBRARY_CONFIG)
export const POST = createAdminLibraryPOST(RESOURCE_LIBRARY_CONFIG)
