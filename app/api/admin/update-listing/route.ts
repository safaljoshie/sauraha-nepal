import { NextResponse } from "next/server"
import { Resend } from "resend"
import { requireAdminApi } from "@/lib/admin-auth"
import { hasListingContactEmail, type BusinessListing } from "@/lib/business-listing"
import { fetchCategoryCatalog, areValidCategoryNames } from "@/lib/category-catalog"
import {
  normalizeListingCategoriesInput,
  serializeListingCategories,
} from "@/lib/listing-categories"
import { buildApprovalEmail, buildRejectionEmail } from "@/lib/emails/listing-status"
import { getSupabaseAdmin } from "@/lib/supabase"

const FROM = process.env.CONTACT_FROM_EMAIL ?? "hello@mail.saurahanepal.com"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PRICE_RANGE_OPTIONS = new Set(["$ Budget", "$$ Mid-range", "$$$ Premium"])
const PLAN_OPTIONS = new Set(["basic", "featured", "premium"])
const STATUS_OPTIONS = new Set(["pending", "approved", "rejected"])

type ListingUpdatePayload = {
  id?: string
  business_name?: string
  category?: string
  categories?: string[]
  description?: string
  price_range?: string
  opening_hours?: string
  owner_name?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  facebook?: string
  address?: string
  google_maps_link?: string
  photo_links?: string
  plan?: string
  status?: string
  verified?: boolean
}

function normalizeOptional(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let payload: ListingUpdatePayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const id = payload.id?.trim()
  const business_name = payload.business_name?.trim() ?? ""
  const categoryNames = normalizeListingCategoriesInput(payload.categories, payload.category)
  const category = serializeListingCategories(categoryNames)
  const owner_name = payload.owner_name?.trim() ?? ""
  const email = payload.email?.trim() ?? ""

  if (!id) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 })
  }
  if (!business_name || categoryNames.length === 0 || !owner_name || !email) {
    return NextResponse.json(
      { error: "Business name, at least one category, owner name, and email are required." },
      { status: 400 },
    )
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
  }
  const catalog = await fetchCategoryCatalog({ includeInactive: true })
  if (!areValidCategoryNames(categoryNames, catalog, { includeInactive: true })) {
    return NextResponse.json({ error: "Invalid category selection." }, { status: 400 })
  }

  const normalizedPlan = payload.plan?.trim().toLowerCase() ?? ""
  const normalizedStatus = payload.status?.trim().toLowerCase() ?? ""
  if (!PLAN_OPTIONS.has(normalizedPlan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 })
  }
  if (!STATUS_OPTIONS.has(normalizedStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  const price_range = payload.price_range?.trim() ?? ""
  if (price_range && !PRICE_RANGE_OPTIONS.has(price_range)) {
    return NextResponse.json({ error: "Invalid price range." }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: existing, error: existingError } = await supabase
      .from("business_listings")
      .select("*")
      .eq("id", id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 })
    }

    const updates = {
      business_name,
      category,
      description: normalizeOptional(payload.description),
      price_range: price_range || null,
      opening_hours: normalizeOptional(payload.opening_hours),
      owner_name,
      email,
      phone: normalizeOptional(payload.phone),
      whatsapp: normalizeOptional(payload.whatsapp),
      website: normalizeOptional(payload.website),
      facebook: normalizeOptional(payload.facebook),
      address: normalizeOptional(payload.address),
      google_maps_link: normalizeOptional(payload.google_maps_link),
      photo_links: normalizeOptional(payload.photo_links),
      plan: normalizedPlan,
      status: normalizedStatus,
      verified: payload.verified === true,
    }

    const { data: updated, error: updateError } = await supabase
      .from("business_listings")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single()

    if (updateError || !updated) {
      console.error("Supabase update error:", updateError)
      return NextResponse.json({ error: "Failed to update listing." }, { status: 500 })
    }

    const record = updated as BusinessListing
    const previous = existing as BusinessListing
    const statusChanged = previous.status !== record.status

    if (!statusChanged || !hasListingContactEmail(record.email)) {
      return NextResponse.json({ success: true, listing: record })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ success: true, listing: record, emailSkipped: true })
    }

    const resend = new Resend(resendKey)
    if (record.status === "approved") {
      const emailData = buildApprovalEmail(record)
      const { error } = await resend.emails.send({
        from: FROM,
        to: record.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
      if (error) console.error("Resend approval email error:", error)
    } else if (record.status === "rejected") {
      const emailData = buildRejectionEmail(record)
      const { error } = await resend.emails.send({
        from: FROM,
        to: record.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
      if (error) console.error("Resend rejection email error:", error)
    }

    return NextResponse.json({ success: true, listing: record })
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 500 })
  }
}
