export type TeamLibraryId = "resources" | "itineraries"

export type TeamPageId = "calendar" | "resources" | "itinerary"

export type TeamLibraryConfig = {
  id: TeamLibraryId
  table: string
  storagePrefix: string
  categories: readonly string[]
  adminApiBase: string
  teamApiPath: string
  teamPage: TeamPageId
  teamPath: string
  navEmoji: string
  navLabel: string
  adminTabLabel: string
  adminIcon: string
  adminTitle: string
  adminDescription: string
  teamTitle: string
  teamSubtitle: string
  titlePlaceholder: string
  descriptionPlaceholder: string
  itemLabel: string
  itemLabelPlural: string
  emptyTeamMessage: string
  emptyAdminMessage: string
  emptySearchMessage: string
  uploadSuccessMessage: string
  deleteSuccessMessage: string
  loadErrorMessage: string
}

export const RESOURCE_LIBRARY_CATEGORIES = [
  "Training Guides",
  "Forms & Templates",
  "Brand Assets",
  "Marketing Materials",
  "Policies & Legal",
  "Other",
] as const

export const ITINERARY_LIBRARY_CATEGORIES = [
  "Day Trips",
  "Multi-Day Tours",
  "Jungle Safaris",
  "Cultural Experiences",
  "Seasonal Plans",
  "Other",
] as const

export const RESOURCE_LIBRARY_CONFIG: TeamLibraryConfig = {
  id: "resources",
  table: "team_resources",
  storagePrefix: "",
  categories: RESOURCE_LIBRARY_CATEGORIES,
  adminApiBase: "/api/admin/resources",
  teamApiPath: "/api/team/resources",
  teamPage: "resources",
  teamPath: "/team/resources",
  navEmoji: "📁",
  navLabel: "Resources",
  adminTabLabel: "Team Resources",
  adminIcon: "folder-open",
  adminTitle: "Team Resources",
  adminDescription: "Upload training guides, forms, and internal files for the team to download.",
  teamTitle: "Team Resources",
  teamSubtitle: "Training guides, forms and materials for the Sauraha Nepal team",
  titlePlaceholder: "e.g. Field Team Listing Guide",
  descriptionPlaceholder: "Short note on what this file is for",
  itemLabel: "resource",
  itemLabelPlural: "resources",
  emptyTeamMessage: "No resources have been uploaded yet. Check back soon.",
  emptyAdminMessage: "No resources uploaded yet.",
  emptySearchMessage: "No resources match your search.",
  uploadSuccessMessage: "Resource uploaded successfully.",
  deleteSuccessMessage: "Resource deleted.",
  loadErrorMessage: "Failed to load resources.",
}

export const ITINERARY_LIBRARY_CONFIG: TeamLibraryConfig = {
  id: "itineraries",
  table: "team_itineraries",
  storagePrefix: "itineraries",
  categories: ITINERARY_LIBRARY_CATEGORIES,
  adminApiBase: "/api/admin/itineraries",
  teamApiPath: "/api/team/itineraries",
  teamPage: "itinerary",
  teamPath: "/team/itinerary",
  navEmoji: "🗺️",
  navLabel: "Itinerary",
  adminTabLabel: "Team Itinerary",
  adminIcon: "map",
  adminTitle: "Team Itinerary",
  adminDescription: "Upload trip plans, day itineraries, and tour schedules for the team to download.",
  teamTitle: "Team Itinerary",
  teamSubtitle: "Trip plans and itineraries for the Sauraha Nepal team",
  titlePlaceholder: "e.g. 3-Day Chitwan Safari Plan",
  descriptionPlaceholder: "Short note on dates, group size, or when to use this itinerary",
  itemLabel: "itinerary",
  itemLabelPlural: "itineraries",
  emptyTeamMessage: "No itineraries have been uploaded yet. Check back soon.",
  emptyAdminMessage: "No itineraries uploaded yet.",
  emptySearchMessage: "No itineraries match your search.",
  uploadSuccessMessage: "Itinerary uploaded successfully.",
  deleteSuccessMessage: "Itinerary deleted.",
  loadErrorMessage: "Failed to load itineraries.",
}
