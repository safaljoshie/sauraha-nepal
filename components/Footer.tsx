import FooterClient from "@/components/FooterClient"
import { fetchSiteSettings } from "@/lib/site-settings"
import type { CategoryCatalog } from "@/lib/category-catalog"

export default async function Footer({ catalog }: { catalog: CategoryCatalog }) {
  const settings = await fetchSiteSettings()
  const facebookUrl = settings.facebook_url.trim()
  const instagramUrl = settings.instagram_url.trim()
  const tiktokUrl =
    settings.tiktok_url.trim() || "https://www.tiktok.com/@saurahanepal.com"

  return (
    <FooterClient
      catalog={catalog}
      facebookUrl={facebookUrl}
      instagramUrl={instagramUrl}
      tiktokUrl={tiktokUrl}
    />
  )
}
