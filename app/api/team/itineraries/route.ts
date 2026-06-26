import { ITINERARY_LIBRARY_CONFIG } from "@/lib/team-library-config"
import {
  createTeamLibraryGET,
  createTeamLibraryMethodNotAllowed,
} from "@/lib/team-library-handlers"

export const GET = createTeamLibraryGET(ITINERARY_LIBRARY_CONFIG)
export const POST = createTeamLibraryMethodNotAllowed()
export const PUT = createTeamLibraryMethodNotAllowed()
export const PATCH = createTeamLibraryMethodNotAllowed()
export const DELETE = createTeamLibraryMethodNotAllowed()
