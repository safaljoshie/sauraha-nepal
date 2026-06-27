import type { Metadata, Viewport } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { ChatUIProvider } from "@/components/ChatUIProvider"
import ChatWidgetLoader from "@/components/ChatWidgetLoader"
import SiteJsonLd from "@/components/seo/SiteJsonLd"
import { SITE_KEYWORDS } from "@/lib/seo"
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saurahanepal.com"),
  title: {
    default:
      "Sauraha Nepal Travel Guide — Hotels, Safari & Things to Do Near Chitwan National Park",
    template: "%s | Sauraha Nepal",
  },
  description:
    "Independent local guide to Sauraha, Nepal. Find verified hotels, restaurants and jungle safari operators near Chitwan National Park, read real traveller reviews, and get distances, prices and practical travel tips.",
  keywords: [...SITE_KEYWORDS],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.saurahanepal.com",
    siteName: "Sauraha Nepal",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sauraha Nepal — Independent Local Travel Guide",
    description:
      "Hotels, restaurants, jungle safaris and practical travel tips for Sauraha, Nepal — gateway to Chitwan National Park",
    images: ["/og-image.jpg"],
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
      <head>
        <SiteJsonLd />
      </head>
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
