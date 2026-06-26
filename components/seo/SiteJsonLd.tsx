import { SITE_URL } from "@/lib/blog-posts"

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sauraha Nepal",
  url: SITE_URL,
  logo: `${SITE_URL}/one.png`,
  description:
    "Independent local travel directory for Sauraha, Nepal, near Chitwan National Park",
}

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sauraha Nepal",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/listings?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

export default function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]) }}
    />
  )
}
