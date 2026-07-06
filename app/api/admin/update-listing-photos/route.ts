import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"
import { dedupePhotoLinks } from "@/lib/list-business-photos"
import { getListingDetailPath } from "@/lib/listing-url"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: { listingId?: string; photo_links?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const listingId = body.listingId?.trim()
  if (!listingId) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 })
  }

  const photo_links = dedupePhotoLinks(body.photo_links ?? "")

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("business_listings")
      .update({ photo_links: photo_links || null })
      .eq("id", listingId)
      .select("id, slug, photo_links")
      .single()

    if (error || !data) {
      console.error("Failed to update listing photos:", error)
      return NextResponse.json({ error: "Failed to update listing photos." }, { status: 500 })
    }

    revalidatePath("/listings")
    revalidatePath(`/listings/${listingId}`)
    revalidatePath(getListingDetailPath(data))

    return NextResponse.json({
      photo_links: data.photo_links ?? "",
    })
  } catch (error) {
    console.error("Update listing photos error:", error)
    return NextResponse.json({ error: "Failed to update listing photos." }, { status: 500 })
  }
}
