import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default async function sitemap() {
  const { data: listings } = await supabase
    .from("business_listings")
    .select("id, created_at")
    .eq("status", "approved")

  const listingUrls = (listings || []).map((listing) => ({
    url: `https://www.saurahanepal.com/listings/${listing.id}`,
    lastModified: new Date(listing.created_at),
    priority: 0.7,
  }))

  return [
    {
      url: "https://www.saurahanepal.com",
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: "https://www.saurahanepal.com/listings",
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: "https://www.saurahanepal.com/about",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://www.saurahanepal.com/contact",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://www.saurahanepal.com/list-your-business",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://www.saurahanepal.com/blog",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://www.saurahanepal.com/blog/best-time-to-visit-sauraha",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://www.saurahanepal.com/blog/how-to-get-to-sauraha",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://www.saurahanepal.com/blog/chitwan-national-park-entry-fees",
      lastModified: new Date(),
      priority: 0.7,
    },
    ...listingUrls,
  ]
}
