import Link from "next/link"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import PageHeader from "@/components/PageHeader"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Sauraha Nepal collects, uses and protects your personal information.",
  path: "/privacy-policy",
})

const LAST_UPDATED = "21 June 2026"

const tocItems = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "business-listings", label: "Business Listings" },
  { id: "reviews", label: "Reviews" },
  { id: "cookies-and-analytics", label: "Cookies and Analytics" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "data-storage-and-security", label: "Data Storage and Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes-to-this-policy", label: "Changes to This Policy" },
  { id: "contact-us", label: "Contact Us" },
] as const

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-green-mid underline-offset-2 hover:underline"
    >
      {children}
    </a>
  )
}

function PolicySection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand md:text-[1.65rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[1.05rem] leading-[1.75] text-text-mid">{children}</div>
    </section>
  )
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <PageHeader
        label="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use and protect your information"
      />

      <article className="mx-auto max-w-[800px] px-6 py-14 md:px-8 md:py-16">
        <p className="text-sm font-medium text-text-light">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-4 text-[1.05rem] leading-[1.75] text-text-mid">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
            Introduction
          </h2>
          <p>
            Sauraha Nepal (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website
            saurahanepal.com (the &quot;Site&quot;), a free travel directory for Sauraha and
            Chitwan National Park, Nepal. This Privacy Policy explains what information we collect,
            how we use it, and the choices you have.
          </p>
          <p>
            By using our Site, you agree to the collection and use of information in accordance
            with this policy.
          </p>
        </div>

        <nav
          aria-label="Table of contents"
          className="mt-10 rounded-2xl border border-border-brand bg-cream p-6 md:p-8"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
            Table of Contents
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[1.05rem] leading-relaxed text-text-mid">
            {tocItems.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="font-medium text-green-mid underline-offset-2 hover:underline"
                >
                  {index + 1}. {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-14 space-y-12">
          <PolicySection id="information-we-collect" title="1. Information We Collect">
            <p>We collect information in the following ways:</p>
            <p className="font-semibold text-text-brand">Information you provide directly:</p>
            <PolicyList
              items={[
                "Name and email address (contact form, newsletter signup)",
                "Business details (name, category, description, contact information, address, photos) when submitting a listing",
                "Reviews and ratings you submit for businesses",
                "Messages sent to our AI travel assistant chat widget",
              ]}
            />
            <p className="font-semibold text-text-brand">Information collected automatically:</p>
            <PolicyList
              items={[
                "IP address and general location (city/country level)",
                "Browser type and device information",
                "Pages visited and time spent on our Site",
                "Referring website (how you found us)",
              ]}
            />
            <p>
              We do not knowingly collect sensitive personal information such as health data,
              financial details, or government identification numbers.
            </p>
          </PolicySection>

          <PolicySection id="how-we-use-your-information" title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <PolicyList
              items={[
                "Display business listings on our directory",
                "Respond to your enquiries and contact form submissions",
                "Review and approve or reject business listing submissions",
                "Display reviews and ratings on listing pages",
                "Send confirmation emails related to your submissions",
                "Improve our Site and understand how visitors use it",
                "Provide responses through our AI travel assistant",
                "Detect and prevent spam or fraudulent submissions",
              ]}
            />
            <p>We do not sell your personal information to third parties.</p>
          </PolicySection>

          <PolicySection id="business-listings" title="3. Business Listings">
            <p>If you submit a business for listing on Sauraha Nepal:</p>
            <PolicyList
              items={[
                "Your business name, description, contact details, address, and photos will be displayed publicly on the Site",
                "Your owner name, email and phone number are used for verification purposes and may be displayed if you provide consent during submission",
                "We reserve the right to edit, reject, or remove listings that violate our guidelines or contain inaccurate information",
                "You may request removal of your listing at any time by contacting us",
              ]}
            />
          </PolicySection>

          <PolicySection id="reviews" title="4. Reviews">
            <p>When you submit a review:</p>
            <PolicyList
              items={[
                'Your first name and last initial are displayed publicly (e.g. "Safal J.")',
                "Your email address is collected for verification but is never displayed publicly",
                "Reviews are moderated before appearing on the Site",
                "We reserve the right to remove reviews that are fraudulent, abusive, or violate our community guidelines",
              ]}
            />
          </PolicySection>

          <PolicySection id="cookies-and-analytics" title="5. Cookies and Analytics">
            <p>We use cookies and similar technologies to:</p>
            <PolicyList
              items={[
                "Remember your preferences",
                "Understand how visitors use our Site (via Google Analytics)",
                "Maintain admin login sessions for site administrators",
              ]}
            />
            <p>
              Google Analytics collects anonymised usage data including pages visited, time on
              site, and general location. You can opt out of Google Analytics tracking using the{" "}
              <ExternalLink href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics Opt-out Browser Add-on
              </ExternalLink>
              .
            </p>
            <p>
              Most browsers allow you to refuse or delete cookies through your browser settings.
              Note that disabling cookies may affect certain features of our Site.
            </p>
          </PolicySection>

          <PolicySection id="third-party-services" title="6. Third-Party Services">
            <p>We use the following third-party services to operate our Site:</p>
            <PolicyList
              items={[
                "Supabase (database hosting) — stores listing and review data",
                "Resend (email service) — sends transactional emails such as listing confirmations",
                "Vercel (website hosting) — hosts our website infrastructure",
                "Google Analytics — website usage analytics",
                "Anthropic Claude API — powers our AI travel assistant chat feature; messages sent to the assistant may be processed by Anthropic's API to generate responses",
              ]}
            />
            <p>
              Each of these providers has their own privacy policy governing how they handle data.
              We encourage you to review their policies:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Supabase:{" "}
                <ExternalLink href="https://supabase.com/privacy">supabase.com/privacy</ExternalLink>
              </li>
              <li>
                Resend:{" "}
                <ExternalLink href="https://resend.com/legal/privacy-policy">
                  resend.com/legal/privacy-policy
                </ExternalLink>
              </li>
              <li>
                Vercel:{" "}
                <ExternalLink href="https://vercel.com/legal/privacy-policy">
                  vercel.com/legal/privacy-policy
                </ExternalLink>
              </li>
              <li>
                Google:{" "}
                <ExternalLink href="https://policies.google.com/privacy">
                  policies.google.com/privacy
                </ExternalLink>
              </li>
              <li>
                Anthropic:{" "}
                <ExternalLink href="https://anthropic.com/legal/privacy">
                  anthropic.com/legal/privacy
                </ExternalLink>
              </li>
            </ul>
          </PolicySection>

          <PolicySection id="data-storage-and-security" title="7. Data Storage and Security">
            <p>
              Your data is stored securely using Supabase&apos;s infrastructure, hosted in the
              Asia Pacific (Tokyo) region. We take reasonable technical and organisational
              measures to protect your information from unauthorised access, alteration, or
              disclosure.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </PolicySection>

          <PolicySection id="your-rights" title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <PolicyList
              items={[
                "Access the personal information we hold about you",
                "Request correction of inaccurate information",
                "Request deletion of your personal information",
                "Object to or restrict certain processing of your data",
                "Withdraw consent where processing is based on consent",
              ]}
            />
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:hello@mail.saurahanepal.com"
                className="font-medium text-green-mid underline-offset-2 hover:underline"
              >
                hello@mail.saurahanepal.com
              </a>
              . We will respond to your request within a reasonable timeframe.
            </p>
          </PolicySection>

          <PolicySection id="childrens-privacy" title="9. Children's Privacy">
            <p>
              Our Site is not directed at children under the age of 13. We do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal information, please contact us and we will take steps to delete it.
            </p>
          </PolicySection>

          <PolicySection id="changes-to-this-policy" title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated &quot;Last updated&quot; date. We encourage you to review this
              policy periodically.
            </p>
            <p>
              Continued use of our Site after changes are posted constitutes your acceptance of
              the updated policy.
            </p>
          </PolicySection>

          <PolicySection id="contact-us" title="11. Contact Us">
            <p>
              If you have any questions about this Privacy Policy or how we handle your
              information, please contact us:
            </p>
            <ul className="list-none space-y-2 pl-0">
              <li>
                Email:{" "}
                <a
                  href="mailto:hello@mail.saurahanepal.com"
                  className="font-medium text-green-mid underline-offset-2 hover:underline"
                >
                  hello@mail.saurahanepal.com
                </a>
              </li>
              <li>
                Website:{" "}
                <Link
                  href="/contact"
                  className="font-medium text-green-mid underline-offset-2 hover:underline"
                >
                  saurahanepal.com/contact
                </Link>
              </li>
              <li>Location: Sauraha, Chitwan, Nepal</li>
            </ul>
          </PolicySection>
        </div>

        <div className="mt-14 border-t border-border-brand pt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-green-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
          >
            ← Back to homepage
          </Link>
        </div>
      </article>
    </main>
  )
}
