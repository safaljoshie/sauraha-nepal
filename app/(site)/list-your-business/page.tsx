import type { Metadata } from "next"
import ListYourBusinessContent from "@/components/list-business/ListYourBusinessContent"
import { fetchCategoryCatalog, getActiveCategoryNames } from "@/lib/category-catalog"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "List Your Business",
  description:
    "List your hotel, restaurant, or activity on Sauraha Nepal — reach travellers visiting Chitwan National Park.",
  path: "/list-your-business",
})

export default async function ListYourBusinessPage() {
  const catalog = await fetchCategoryCatalog()
  const categories = getActiveCategoryNames(catalog)

  return (
    <main>
      <ListYourBusinessContent categories={categories} />
    </main>
  )
}
