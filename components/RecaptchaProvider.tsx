"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

export default function RecaptchaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // Without a site key (e.g. local dev), render children untouched. The token
  // hook returns null and server routes skip verification.
  if (!siteKey) {
    return <>{children}</>
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{ async: true, defer: true }}>
      {children}
    </GoogleReCaptchaProvider>
  )
}
