import { redirect } from "next/navigation"
import ProfileForm from "@/components/account/ProfileForm"
import DangerZone from "@/components/account/DangerZone"
import { getOwnProfile, toProfileView } from "@/lib/profiles"

export default async function AccountProfilePage() {
  const result = await getOwnProfile()
  if (!result) redirect("/signin?next=/account")

  const view = toProfileView(result.user, result.profile)

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Profile</h1>
        <p className="mt-1 text-text-mid">
          Manage the details shown with your reviews.
        </p>
      </header>

      <ProfileForm
        initialDisplayName={view.displayName}
        initialCountry={view.country}
        email={view.email}
      />

      <DangerZone />
    </div>
  )
}
