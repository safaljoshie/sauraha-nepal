import Navbar from "@/components/Navbar"
import { fetchCategoryCatalog } from "@/lib/category-catalog"

export default async function SiteNavbar() {
  const catalog = await fetchCategoryCatalog()
  return <Navbar catalog={catalog} />
}
