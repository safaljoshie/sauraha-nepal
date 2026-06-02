import ContactForm, { ContactSidebar } from "@/components/ContactForm"
import PageHeader from "@/components/PageHeader"

export const metadata = {
  title: "Contact & List Your Business",
}

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        label="Get In Touch"
        title="Contact & List Your Business"
        subtitle="Questions, listings, partnerships — we're here to help"
      />

      <div className="mx-auto grid max-w-5xl gap-12 px-8 py-16 md:grid-cols-[1fr_1.4fr]">
        <ContactSidebar />
        <ContactForm />
      </div>
    </main>
  )
}
