import { revalidatePath } from "next/cache"
import type { BusinessListing } from "@/lib/business-listing"
import { getListingDetailPath } from "@/lib/listing-url"

/**
 * Invalidate every cached path that renders a listing.
 *
 * Public pages are fully static (no time-based `revalidate`), so this is the
 * only thing that publishes an approval, edit, or deletion — call it after any
 * admin write that changes what the directory shows.
 */
export function revalidateListingPaths(
  listing: Pick<BusinessListing, "id" | "slug">,
) {
  revalidatePath("/")
  revalidatePath("/listings")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/listings/${listing.id}`)

  const detailPath = getListingDetailPath(listing)
  if (detailPath !== `/listings/${listing.id}`) {
    revalidatePath(detailPath)
  }
}

/**
 * Invalidate everything after a category or category-group change.
 *
 * The catalog feeds Navbar and SiteFooter, both of which live in the `(site)`
 * layout, so a layout-wide purge is genuinely the correct scope here.
 */
export function revalidateCategoryCatalog() {
  revalidatePath("/", "layout")
}
