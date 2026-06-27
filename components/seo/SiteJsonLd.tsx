const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sauraha Nepal",
  alternateName: "saurahanepal.com",
  url: "https://www.saurahanepal.com",
  logo: "https://www.saurahanepal.com/one.png",
  description:
    "Independent local travel directory for Sauraha, Nepal, near Chitwan National Park",
}

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sauraha Nepal",
  url: "https://www.saurahanepal.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.saurahanepal.com/listings?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default function SiteJsonLd() {
  return (
    <>
      <JsonLdScript data={ORGANIZATION} />
      <JsonLdScript data={WEBSITE} />
    </>
  )
}
