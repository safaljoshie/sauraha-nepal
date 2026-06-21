import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { ChatUIProvider } from "@/components/ChatUIProvider"
import ChatWidgetLoader from "@/components/ChatWidgetLoader"
import { Inter, Nunito, Playfair_Display, Poppins } from "next/font/google"
import "./globals.css"
import { DEFAULT_OG_IMAGE, SITE_KEYWORDS } from "@/lib/seo"

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
    default:
      "Sauraha Nepal — Hotels, Restaurants & Jungle Safari Guide | Chitwan National Park",
    template: "%s | Sauraha Nepal",
  },
  description:
    "Find verified hotels, restaurants, jungle safari operators and tour guides in Sauraha, Nepal — the gateway to Chitwan National Park. Compare prices, read real reviews, and plan your Chitwan trip.",
  keywords: [...SITE_KEYWORDS],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.saurahanepal.com",
    siteName: "Sauraha Nepal",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sauraha Nepal — Your Complete Chitwan Travel Guide",
    description: "Hotels, restaurants, jungle safaris and tour guides in Sauraha, Nepal",
    images: [DEFAULT_OG_IMAGE],
  },
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
