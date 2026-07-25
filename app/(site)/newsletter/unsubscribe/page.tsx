import Link from "next/link"
import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"
import { unsubscribeSubscriber } from "@/lib/newsletter-tokens"
import { pageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Unsubscribe",
  description: "Unsubscribe from the Sauraha Nepal newsletter.",
  path: "/newsletter/unsubscribe",
})

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  // One-click: unsubscribe on load, no confirmation dialog.
  const result = token
    ? await unsubscribeSubscriber(token)
    : { ok: false as const, reason: "invalid" as const }
  const failedHard = !result.ok && result.reason === "error"

  return (
    <main>
      <PageHeader
        label="Newsletter"
        title={failedHard ? "Something went wrong" : "You've been unsubscribed"}
        subtitle={
          failedHard
            ? "We couldn't process your request."
            : "Your email has been removed from our newsletter."
        }
      />

      <div className="mx-auto max-w-[640px] px-6 py-14 text-center md:px-8 md:py-20">
        {failedHard ? (
          <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-text-mid">
            Please try again in a moment, or email{" "}
            <a
              href="mailto:hello@mail.saurahanepal.com"
              className="font-medium text-green-mid underline-offset-2 hover:underline"
            >
              hello@mail.saurahanepal.com
            </a>{" "}
            and we&apos;ll remove you manually.
          </p>
        ) : (
          <>
            <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-text-mid">
              You won&apos;t receive any more emails from Sauraha Nepal.
            </p>
            <p className="mt-6 text-[1.05rem] text-text-mid">
              Changed your mind?{" "}
              <Link
                href="/#newsletter"
                className="font-semibold text-green-mid underline-offset-2 hover:underline"
              >
                Re-subscribe here
              </Link>
              .
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center rounded-xl bg-green-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
              >
                Back to homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
