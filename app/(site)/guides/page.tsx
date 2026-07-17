import type { Metadata } from "next"
import GuideTypesSection from "@/components/guides/GuideTypesSection"
import GuidesBreadcrumbs from "@/components/guides/GuidesBreadcrumbs"
import GuidesDirectory from "@/components/guides/GuidesDirectory"
import GuidesFaq from "@/components/guides/GuidesFaq"
import GuidesHero from "@/components/guides/GuidesHero"
import GuidesHowItWorks from "@/components/guides/GuidesHowItWorks"
import GuidesIntro from "@/components/guides/GuidesIntro"
import GuidesJsonLd from "@/components/guides/GuidesJsonLd"
import GuidesListCta from "@/components/guides/GuidesListCta"
import GuidesRelatedLinks from "@/components/guides/GuidesRelatedLinks"
import GuidesWhyVerified from "@/components/guides/GuidesWhyVerified"
import {
  GUIDES_KEYWORDS,
  GUIDES_PAGE_DESCRIPTION,
  GUIDES_PAGE_PATH,
  GUIDES_PAGE_TITLE,
} from "@/lib/guides-seo"
import { DEFAULT_OG_IMAGE, pageMetadata } from "@/lib/seo"
import { fetchApprovedGuides } from "@/lib/tour-guides"

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: GUIDES_PAGE_TITLE,
  description: GUIDES_PAGE_DESCRIPTION,
  path: GUIDES_PAGE_PATH,
  image: DEFAULT_OG_IMAGE,
  keywords: [...GUIDES_KEYWORDS],
  titleAbsolute: true,
  socialTitle: GUIDES_PAGE_TITLE,
})

export default async function GuidesPage() {
  const guides = await fetchApprovedGuides()

  return (
    <main>
      <GuidesJsonLd guides={guides} />
      <GuidesBreadcrumbs />
      <GuidesHero />
      <GuidesDirectory guides={guides} intro={<GuidesIntro />} />
      <GuideTypesSection />
      <GuidesWhyVerified />
      <GuidesHowItWorks />
      <GuidesListCta />
      <GuidesFaq />
      <GuidesRelatedLinks />
    </main>
  )
}
