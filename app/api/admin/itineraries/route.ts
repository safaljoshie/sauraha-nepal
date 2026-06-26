import { ITINERARY_LIBRARY_CONFIG } from "@/lib/team-library-config"
import {
  createAdminLibraryDELETE,
  createAdminLibraryGET,
  createAdminLibraryPOST,
} from "@/lib/team-library-handlers"

export const GET = createAdminLibraryGET(ITINERARY_LIBRARY_CONFIG)
export const POST = createAdminLibraryPOST(ITINERARY_LIBRARY_CONFIG)
