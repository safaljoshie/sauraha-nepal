import Footer from "@/components/Footer"
import { fetchCategoryCatalog } from "@/lib/category-catalog"

export default async function SiteFooter() {
  const catalog = await fetchCategoryCatalog()
  return <Footer catalog={catalog} />
}
