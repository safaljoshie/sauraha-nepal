import type { Metadata } from "next"
import ContactForm, { ContactSidebarContent } from "@/components/ContactForm"
import PageHeader from "@/components/PageHeader"
import { fetchContactPageContent } from "@/lib/site-content"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Contact & List Your Business",
  description:
    "Contact Sauraha Nepal for travel questions, partnerships, or to list your business in our directory.",
  path: "/contact",
})

export default function ContactPage() {
  return <ContactPageContent />
}

async function ContactPageContent() {
  const content = await fetchContactPageContent()

  const heading = content?.heading ?? "Let's connect"
  const subheading =
    content?.subheading ??
    "Have a question about Sauraha? Want to list your business or partner with us? Fill in the form and we'll get back to you within 24 hours."

  return (
    <main>
      <PageHeader
        label="Get In Touch"
        title="Contact & List Your Business"
        subtitle="Questions, listings, partnerships — we're here to help"
      />

      <div className="mx-auto grid max-w-5xl gap-12 px-8 py-16 md:grid-cols-[1fr_1.4fr]">
        <ContactSidebarContent
          heading={heading}
          subheading={subheading}
          address={content?.address ?? "Sauraha, Chitwan, Nepal"}
          phone={content?.phone ?? ""}
          whatsapp={content?.whatsapp ?? "+977 98XXXXXXXX"}
          email={content?.email ?? "hello@mail.saurahanepal.com"}
          responseTime={content?.response_time ?? "Within 24 hours (NPT timezone)"}
        />
        <ContactForm />
      </div>
    </main>
  )
}
