import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { fetchCategoryCatalog } from "@/lib/category-catalog"

export const revalidate = 60

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const catalog = await fetchCategoryCatalog()

  return (
    <>
      <Navbar catalog={catalog} />
      {children}
      <Footer catalog={catalog} />
    </>
  )
}
