import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { Nunito, Playfair_Display } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saurahanepal.com"),
  title: {
    default: "Sauraha Nepal – Your Complete Guide to Sauraha",
    template: "%s – Sauraha Nepal",
  },
  description:
    "Your complete guide to Sauraha — hotels, restaurants, activities, and everything at the gateway to Chitwan National Park.",
}

const gaId = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
        {process.env.NODE_ENV === "production" && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
