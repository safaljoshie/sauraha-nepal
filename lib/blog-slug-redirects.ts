/** Old static blog paths → current published post slugs. */
export const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  "how-to-get-to-sauraha":
    "how-to-get-to-sauraha-from-kathmandu-and-pokhara-2026-travel-guide",
  "chitwan-national-park-entry-fees":
    "park-permits-to-visit-sauraha-community-forest-vs-national-forest-2026-guide",
}

export function getBlogSlugRedirect(slug: string): string | undefined {
  return BLOG_SLUG_REDIRECTS[slug]
}
