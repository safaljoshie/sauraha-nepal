import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { getCurrentUser } from "@/lib/supabase/auth-server"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Sauraha Nepal to leave reviews and manage your profile.",
  robots: { index: false, follow: false },
}

function safeNext(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next
  return "/account"
}

const ERRORS: Record<string, string> = {
  deactivated: "This account was deactivated. Contact us if you'd like it restored.",
  auth: "Sign-in didn't complete. Please try again.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)

  const user = await getCurrentUser()
  if (user) redirect(next)

  const errorMessage = params.error ? ERRORS[params.error] : null

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left: brand panel + sign-in */}
      <div className="relative flex w-full flex-col justify-between bg-green-brand px-8 py-10 text-white md:w-[46%] md:px-14 md:py-14 lg:w-[40%]">
        <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
          ← Back to Sauraha Nepal
        </Link>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Welcome</h1>
          <p className="mt-3 text-white/80">
            Sign in to leave reviews and manage your profile. New here? Continuing with Google
            creates your account.
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
            >
              {errorMessage}
            </p>
          )}

          <div className="mt-8">
            <GoogleSignInButton next={next} />
          </div>

          <p className="mt-6 text-xs text-white/70">
            By continuing you agree to our{" "}
            <Link href="/privacy-policy" className="underline hover:text-white">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <p className="text-xs text-white/60">© {new Date().getFullYear()} Sauraha Nepal</p>
      </div>

      {/* Right: feature image (hidden on small screens) */}
      <div className="relative hidden md:block md:w-[54%] lg:w-[60%]">
        <Image
          src="/images/signin-feature.avif"
          alt="A train winding through the forested hills near Sauraha, Nepal"
          fill
          priority
          sizes="(max-width: 768px) 0px, 60vw"
          className="object-cover"
        />
      </div>
    </main>
  )
}
