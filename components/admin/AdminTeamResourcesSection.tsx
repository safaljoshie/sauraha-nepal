import AdminTeamLibrarySection from "@/components/admin/AdminTeamLibrarySection"
import { RESOURCE_LIBRARY_CONFIG } from "@/lib/team-library-config"

export default function AdminTeamResourcesSection() {
  return <AdminTeamLibrarySection config={RESOURCE_LIBRARY_CONFIG} />
}
