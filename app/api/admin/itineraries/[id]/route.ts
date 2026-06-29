import { ITINERARY_LIBRARY_CONFIG } from "@/lib/team-library-config"
import { createAdminLibraryDELETE, createAdminLibraryPUT } from "@/lib/team-library-handlers"

export const PUT = createAdminLibraryPUT(ITINERARY_LIBRARY_CONFIG)
export const DELETE = createAdminLibraryDELETE(ITINERARY_LIBRARY_CONFIG)
