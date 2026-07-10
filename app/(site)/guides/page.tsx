import type { Metadata } from "next"
import Link from "next/link"
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
  twitter: {
    card: "summary_large_image",
    title: "Tour Guides in Sauraha | Licensed Local Guides | Sauraha Nepal",
    description:
      "Find licensed local tour guides in Sauraha for jungle safari, bird watching, Tharu culture tours and more. Contact guides directly — no commission.",
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
      <div className="site-container pt-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-green-brand/25 bg-green-mid/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-brand">
            Are you a licensed local guide in Sauraha? Get your profile listed on Sauraha Nepal.
          </p>
          <Link
            href="/list-your-guide"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-green-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-mid"
          >
            List yourself as a Guide!
          </Link>
        </div>
      </div>
      <GuidesDirectory guides={guides} />
    </main>
  )
}
