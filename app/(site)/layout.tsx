import { Suspense } from "react"
import MobileBottomNav from "@/components/MobileBottomNav"
import SiteFooter from "@/components/SiteFooter"
import SiteNavbar from "@/components/SiteNavbar"

export const revalidate = 60

function NavbarFallback() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-[68px] border-b border-black/5 bg-white/80 backdrop-blur-md"
      aria-hidden
    />
  )
}

function FooterFallback() {
  return <footer className="min-h-[280px] bg-ink" aria-hidden />
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <SiteNavbar />
      </Suspense>
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</div>
      <Suspense fallback={<FooterFallback />}>
        <SiteFooter />
      </Suspense>
      <MobileBottomNav />
    </>
  )
}
