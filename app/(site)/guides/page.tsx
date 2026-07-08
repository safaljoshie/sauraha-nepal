import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"
import GuidesDirectory from "@/components/guides/GuidesDirectory"
import { fetchApprovedGuides } from "@/lib/tour-guides"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Tour Guides in Sauraha | Licensed Local Guides",
  description:
    "Find licensed local tour guides in Sauraha for jungle safari, bird watching, Tharu culture tours and more. Contact guides directly — no commission.",
  alternates: { canonical: "https://www.saurahanepal.com/guides" },
  openGraph: {
    title: "Tour Guides in Sauraha | Sauraha Nepal",
    description:
      "Licensed local guides for jungle safari, bird watching, Tharu culture tours and more in Sauraha, Chitwan.",
    url: "https://www.saurahanepal.com/guides",
    siteName: "Sauraha Nepal",
    type: "website",
  },
}

export default async function GuidesPage() {
  const guides = await fetchApprovedGuides()

  return (
    <main>
      <PageHeader
        label="Meet your guide"
        title="Tour Guides in Sauraha"
        subtitle="Licensed local guides for jungle safari, bird watching, Tharu culture tours and more"
      />
      <GuidesDirectory guides={guides} />
    </main>
  )
}
