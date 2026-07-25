import Link from "next/link"
import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"
import { confirmSubscriber } from "@/lib/newsletter-tokens"
import { pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Confirm your subscription",
  description: "Confirm your Sauraha Nepal newsletter subscription.",
  path: "/newsletter/confirm",
})

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const result = token ? await confirmSubscriber(token) : { ok: false as const, reason: "invalid" as const }

  return (
    <main>
      <PageHeader
        label="Newsletter"
        title={result.ok ? "You're subscribed!" : "Confirmation failed"}
        subtitle={
          result.ok
            ? "Thanks for confirming your email address."
            : "We couldn't confirm your subscription."
        }
      />

      <div className="mx-auto max-w-[640px] px-6 py-14 text-center md:px-8 md:py-20">
        {result.ok ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-brand/10 text-3xl text-green-brand">
              ✓
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
              You&apos;re subscribed! 🎉
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[1.05rem] leading-relaxed text-text-mid">
              You&apos;ll receive our latest Sauraha travel guides, new listings, and Chitwan
              updates straight to your inbox.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-xl bg-green-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
              >
                View our latest articles
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-border-brand bg-white px-6 py-3 text-sm font-semibold text-text-mid transition-colors hover:bg-cream"
              >
                Back to homepage
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-text-mid">
              This confirmation link is invalid or has expired. You can subscribe again from our
              homepage to receive a fresh confirmation email.
            </p>
            <div className="mt-8">
              <Link
                href="/#newsletter"
                className="inline-flex items-center rounded-xl bg-green-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
              >
                Subscribe again
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
