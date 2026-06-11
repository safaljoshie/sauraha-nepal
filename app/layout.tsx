import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { ChatUIProvider } from "@/components/ChatUIProvider"
import ChatWidgetLoader from "@/components/ChatWidgetLoader"
import { Inter, Nunito, Playfair_Display, Poppins } from "next/font/google"
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
})

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saurahanepal.com"),
  title: {
    default: "Sauraha Nepal – Your Complete Guide to Sauraha",
    template: "%s – Sauraha Nepal",
  },
  description:
    "Your complete guide to Sauraha — hotels, restaurants, activities, and everything at the gateway to Chitwan National Park.",
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
}

const gaId = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${nunito.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="font-[family-name:var(--font-inter)] antialiased">
        <ChatUIProvider>
          {children}
          <ChatWidgetLoader />
        </ChatUIProvider>
        <Analytics />
        {process.env.NODE_ENV === "production" && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
