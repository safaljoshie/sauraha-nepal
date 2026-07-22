import { redirect } from "next/navigation"
import type { Metadata } from "next"
import AccountShell from "@/components/account/AccountShell"
import { getOwnProfile, toProfileView } from "@/lib/profiles"

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const result = await getOwnProfile()
  if (!result) redirect("/signin?next=/account")

  const { user, profile } = result
  // Deactivated (soft-deleted) accounts must not use the dashboard.
  if (profile?.deleted_at) redirect("/signin?error=deactivated")

  const view = toProfileView(user, profile)

  return (
    <AccountShell name={view.displayName} email={view.email} avatarUrl={view.avatarUrl}>
      {children}
    </AccountShell>
  )
}
