import { Suspense } from "react"
import MobileBottomNav from "@/components/MobileBottomNav"
import Navbar from "@/components/Navbar"
import SiteFooter from "@/components/SiteFooter"
import { fetchCategoryCatalog } from "@/lib/category-catalog"

function FooterFallback() {
  return <footer className="min-h-[280px] bg-ink" aria-hidden />
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const catalog = await fetchCategoryCatalog()

  return (
    <div id="site-root">
      <Navbar catalog={catalog} />
      <div className="mobile-bottom-nav-clearance md:pb-0">{children}</div>
      <Suspense fallback={<FooterFallback />}>
        <SiteFooter />
      </Suspense>
      <MobileBottomNav />
    </div>
  )
}
