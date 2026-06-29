import { ITINERARY_LIBRARY_CONFIG } from "@/lib/team-library-config"
import { createTeamLibraryFileRoute } from "@/lib/team-library-handlers"

export const GET = createTeamLibraryFileRoute(ITINERARY_LIBRARY_CONFIG, "attachment")
