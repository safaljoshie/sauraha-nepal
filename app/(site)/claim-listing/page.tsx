import Link from "next/link"
import type { Metadata } from "next"
import SiteIcon from "@/components/icons/SiteIcon"
import PageHeader from "@/components/PageHeader"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Claim Your Listing",
  description:
    "Already listed on Sauraha Nepal? Claim your business listing to update details, add photos, and respond to reviews.",
  path: "/claim-listing",
})

const CLAIM_MAILTO =
  "mailto:hello@mail.saurahanepal.com?subject=Claim%20My%20Listing&body=Business%20name%3A%0ALink%20to%20my%20listing%3A%0A"

const benefits = [
  {
    icon: "pencil",
    title: "Update Your Details",
    description:
      "Correct or update your business information, hours, and contact details anytime.",
  },
  {
    icon: "camera",
    title: "Add Photos",
    description: "Showcase your business with high quality photos that attract more visitors.",
  },
  {
    icon: "star",
    title: "Respond to Reviews",
    description: "Engage with customer reviews and build trust with future visitors.",
  },
  {
    icon: "sparkles",
    title: "Upgrade Your Plan",
    description: "Move to Featured or Premium for better visibility and more enquiries.",
  },
] as const

const steps = [
  {
    step: "1",
    title: "Find Your Listing",
    description:
      "Search for your business on our listings page and copy the link to your listing page.",
  },
  {
    step: "2",
    title: "Contact Us",
    description:
      "Email us at hello@mail.saurahanepal.com with your listing link and proof that you own or manage the business (e.g. business registration, photo ID, or official email domain).",
  },
  {
    step: "3",
    title: "Get Verified",
    description:
      "Our team will verify your ownership within 48 hours and grant you access to manage your listing.",
  },
] as const

const faqItems = [
  {
    question: "Is claiming my listing free?",
    answer:
      "Yes, claiming your existing listing is completely free. You only pay if you choose to upgrade to a Featured or Premium plan.",
  },
  {
    question: "What if my business isn't listed yet?",
    answer: (
      <>
        If your business doesn&apos;t appear on our directory yet, you can submit it directly
        on our{" "}
        <Link href="/list-your-business" className="font-medium text-green-mid hover:underline">
          List Your Business
        </Link>{" "}
        page instead of claiming.
      </>
    ),
  },
  {
    question: "How long does verification take?",
    answer: "We typically verify and respond to claim requests within 48 hours.",
  },
  {
    question: "What proof do I need to claim my listing?",
    answer:
      "Any reasonable proof of ownership works — a business registration document, an email from your official business domain, or a photo of you at the business with signage visible.",
  },
] as const

export default function ClaimListingPage() {
  return (
    <main>
      <PageHeader
        label="For Business Owners"
        title="Claim Your Listing"
        subtitle="Is your business listed on Sauraha Nepal? Take ownership and start managing it today."
      />

      <div className="mx-auto max-w-[800px] px-6 py-14 md:px-8 md:py-16">
        <section>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-[1.65rem]">
            Found your business on Sauraha Nepal?
          </h2>
          <p className="mt-4 text-[1.05rem] leading-[1.75] text-text-mid">
            If your business already appears on our directory but you haven&apos;t submitted it
            yourself, you can claim it. Claiming your listing lets you update details, add photos,
            respond to reviews, and upgrade to a Featured or Premium plan.
          </p>
        </section>

        <section className="mt-14">
          <p className="section-label">Benefits</p>
          <h2 className="section-title">Why claim your listing</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border-[1.5px] border-border-brand bg-white p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-mid/10 text-green-brand">
                  <SiteIcon name={benefit.icon} size={28} strokeWidth={2.25} />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-green-brand">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-light">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <p className="section-label text-center">Process</p>
          <h2 className="section-title text-center">How to claim your listing</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-brand text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-green-brand">{item.title}</h3>
                <p className="text-sm leading-relaxed text-text-light">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        className="px-6 py-14 md:px-8 md:py-16"
        style={{ background: "linear-gradient(135deg, #e8621a, #c94d0e)" }}
      >
        <div className="mx-auto max-w-[800px] text-center text-white">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold md:text-3xl">
            Ready to claim your listing?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 md:text-lg">
            Email us with your business details and we&apos;ll verify your ownership within 48
            hours.
          </p>
          <a
            href={CLAIM_MAILTO}
            className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-bold tracking-wide text-orange-brand uppercase transition-colors hover:bg-white/90"
          >
            Email Us to Claim →
          </a>
          <p className="mt-5 text-sm text-white/80">
            Or visit our{" "}
            <Link href="/contact" className="font-semibold text-white underline-offset-2 hover:underline">
              Contact page
            </Link>{" "}
            for other ways to reach us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[800px] px-6 py-14 md:px-8 md:py-16">
        <p className="section-label text-center">FAQ</p>
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border-brand bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-green-brand [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="shrink-0 text-orange-brand transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="border-t border-border-brand px-5 py-4 text-sm leading-relaxed text-text-mid">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
