import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export const revalidate = 60

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
