import type { TourGuide } from "@/lib/tour-guides"
import { buildGuidesIndexJsonLd } from "@/lib/guides-seo"

type GuidesJsonLdProps = {
  guides: TourGuide[]
}

export default function GuidesJsonLd({ guides }: GuidesJsonLdProps) {
  const graphs = buildGuidesIndexJsonLd(guides)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs) }}
    />
  )
}
