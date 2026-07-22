"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

let warnedMissingKey = false

export default function RecaptchaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // Without a site key (e.g. local dev, or the var wasn't inlined at build time
  // because it's missing from the Production environment), render children
  // untouched. The token hook returns null and — if RECAPTCHA_SECRET_KEY is set
  // server-side — those submissions will be rejected. Make that loud so a prod
  // misconfiguration is obvious in the console instead of a silent failure.
  if (!siteKey) {
    if (typeof window !== "undefined" && !warnedMissingKey) {
      warnedMissingKey = true
      console.warn(
        "[recaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not present in this build. " +
          "reCAPTCHA is disabled on the client, so protected submissions will be rejected. " +
          "Set it for the Production environment in Vercel and redeploy (it is inlined at build time).",
      )
    }
    return <>{children}</>
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{ async: true, defer: true }}>
      {children}
    </GoogleReCaptchaProvider>
  )
}
