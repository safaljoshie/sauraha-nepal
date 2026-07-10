import { cache } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export type GuideService = {
  name: string
  price_npr: number
  description?: string
}

export type GuideStatus = "pending" | "approved" | "rejected"

export type TourGuide = {
  id: string
  slug: string | null
  created_at: string
  updated_at: string
  full_name: string
  nickname: string | null
  photo_url: string | null
  bio: string | null
  years_experience: number | null
  location: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  facebook_url: string | null
  instagram_url: string | null
  website_url: string | null
  licence_number: string | null
  licence_verified: boolean
  is_verified: boolean
  verified_at: string | null
  languages: string[]
  expertise: string[]
  services: GuideService[]
  status: GuideStatus
  avg_rating: number
  review_count: number
  meta_title: string | null
  meta_description: string | null
}

export type GuideReview = {
  id: string
  created_at: string
  guide_id: string
  reviewer_name: string
  reviewer_email: string | null
  reviewer_country: string | null
  rating: number
  comment: string
  status: GuideStatus
  visit_date: string | null
  tour_type: string | null
}

export const COMMON_LANGUAGES = [
  "Nepali",
  "Tharu",
  "English",
  "Hindi",
  "Chinese",
  "German",
  "French",
  "Japanese",
  "Korean",
  "Spanish",
] as const

export const COMMON_EXPERTISE = [
  "Jungle Safari",
  "Jeep Safari",
  "Bird Watching",
  "Canoe/Boat",
  "Night Safari",
  "Photography Tour",
  "Tharu Culture",
  "Village Tour",
  "Wildlife Tracking",
  "Elephant Bathing",
  "Walking Tour",
] as const

export const TOUR_TYPE_OPTIONS = [
  "Jungle Safari",
  "Bird Watching",
  "Canoe Ride",
  "Tharu Culture",
  "Other",
] as const

const GUIDE_SELECT =
  "id, slug, created_at, updated_at, full_name, nickname, photo_url, bio, years_experience, location, phone, whatsapp, email, facebook_url, instagram_url, website_url, licence_number, licence_verified, is_verified, verified_at, languages, expertise, services, status, avg_rating, review_count, meta_title, meta_description"

export function parseGuideServices(raw: unknown): GuideService[] {
  if (!Array.isArray(raw)) return []
  const services: GuideService[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const name = typeof record.name === "string" ? record.name.trim() : ""
    const price = Number(record.price_npr)
    if (!name || !Number.isFinite(price) || price < 0) continue
    const description =
      typeof record.description === "string" ? record.description.trim() : undefined
    services.push({ name, price_npr: Math.round(price), description })
  }
  return services
}

export function normalizeTourGuide(row: Record<string, unknown>): TourGuide {
  return {
    id: String(row.id),
    slug: typeof row.slug === "string" ? row.slug : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    full_name: String(row.full_name ?? ""),
    nickname: typeof row.nickname === "string" ? row.nickname : null,
    photo_url: typeof row.photo_url === "string" ? row.photo_url : null,
    bio: typeof row.bio === "string" ? row.bio : null,
    years_experience:
      typeof row.years_experience === "number" ? row.years_experience : null,
    location: typeof row.location === "string" ? row.location : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    whatsapp: typeof row.whatsapp === "string" ? row.whatsapp : null,
    email: typeof row.email === "string" ? row.email : null,
    facebook_url: typeof row.facebook_url === "string" ? row.facebook_url : null,
    instagram_url: typeof row.instagram_url === "string" ? row.instagram_url : null,
    website_url: typeof row.website_url === "string" ? row.website_url : null,
    licence_number: typeof row.licence_number === "string" ? row.licence_number : null,
    licence_verified: row.licence_verified === true,
    is_verified: row.is_verified === true,
    verified_at: typeof row.verified_at === "string" ? row.verified_at : null,
    languages: Array.isArray(row.languages)
      ? row.languages.filter((v): v is string => typeof v === "string")
      : [],
    expertise: Array.isArray(row.expertise)
      ? row.expertise.filter((v): v is string => typeof v === "string")
      : [],
    services: parseGuideServices(row.services),
    status: (row.status as GuideStatus) ?? "pending",
    avg_rating: Number(row.avg_rating) || 0,
    review_count: Number(row.review_count) || 0,
    meta_title: typeof row.meta_title === "string" ? row.meta_title : null,
    meta_description:
      typeof row.meta_description === "string" ? row.meta_description : null,
  }
}

export function getGuideInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
}

export function getGuideStartingPrice(services: GuideService[]) {
  if (services.length === 0) return null
  return Math.min(...services.map((s) => s.price_npr))
}

export function formatGuideWhatsAppUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "")
  if (!digits) return ""
  return `https://wa.me/${digits}`
}

export function formatGuidePhoneUrl(phone: string) {
  const trimmed = phone.trim()
  if (!trimmed) return ""
  return `tel:${trimmed.replace(/\s+/g, "")}`
}

export function truncateGuideBio(bio: string | null, max = 155) {
  const text = bio?.trim() ?? ""
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function collectGuideLanguages(guides: TourGuide[]) {
  const set = new Set<string>()
  for (const guide of guides) {
    for (const lang of guide.languages) {
      const trimmed = lang.trim()
      if (trimmed) set.add(trimmed)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function collectGuideExpertise(guides: TourGuide[]) {
  const set = new Set<string>()
  for (const guide of guides) {
    for (const tag of guide.expertise) {
      const trimmed = tag.trim()
      if (trimmed) set.add(trimmed)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

async function queryGuides(client: SupabaseClient, approvedOnly: boolean) {
  let query = client.from("tour_guides").select(GUIDE_SELECT).order("full_name")
  if (approvedOnly) query = query.eq("status", "approved")
  return query
}

export const fetchApprovedGuides = cache(async (): Promise<TourGuide[]> => {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await queryGuides(admin, true)
    if (!error && data) return data.map((row) => normalizeTourGuide(row))
  } catch {
    // fallback
  }

  try {
    const supabase = getSupabasePublic()
    const { data, error } = await queryGuides(supabase, true)
    if (error || !data) return []
    return data.map((row) => normalizeTourGuide(row))
  } catch {
    return []
  }
})

export const fetchApprovedGuideById = cache(async (id: string): Promise<TourGuide | null> => {
  const trimmed = id.trim()
  if (!trimmed) return null

  const fetchOne = async (client: SupabaseClient) => {
    const { data, error } = await client
      .from("tour_guides")
      .select(GUIDE_SELECT)
      .eq("id", trimmed)
      .eq("status", "approved")
      .maybeSingle()
    if (error || !data) return null
    return normalizeTourGuide(data)
  }

  try {
    const admin = getSupabaseAdmin()
    const guide = await fetchOne(admin)
    if (guide) return guide
  } catch {
    // fallback
  }

  try {
    return await fetchOne(getSupabasePublic())
  } catch {
    return null
  }
})

/** Resolve an approved guide by slug first, then UUID id for backward compatibility. */
export const fetchApprovedGuideBySlugOrId = cache(
  async (slugOrId: string): Promise<TourGuide | null> => {
    const trimmed = slugOrId.trim()
    if (!trimmed) return null

    const fetchBy = async (client: SupabaseClient, column: "slug" | "id", value: string) => {
      const { data, error } = await client
        .from("tour_guides")
        .select(GUIDE_SELECT)
        .eq(column, value)
        .eq("status", "approved")
        .maybeSingle()
      if (error || !data) return null
      return normalizeTourGuide(data)
    }

    const fetchWithFallback = async (client: SupabaseClient) => {
      const bySlug = await fetchBy(client, "slug", trimmed)
      if (bySlug) return bySlug
      return fetchBy(client, "id", trimmed)
    }

    try {
      const guide = await fetchWithFallback(getSupabaseAdmin())
      if (guide) return guide
    } catch {
      // fallback
    }

    try {
      return await fetchWithFallback(getSupabasePublic())
    } catch {
      return null
    }
  },
)

export async function fetchAllGuidesAdmin(): Promise<TourGuide[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("tour_guides")
    .select(GUIDE_SELECT)
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return data.map((row) => normalizeTourGuide(row))
}

export async function fetchGuideByIdAdmin(id: string): Promise<TourGuide | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("tour_guides")
    .select(GUIDE_SELECT)
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return normalizeTourGuide(data)
}

export async function fetchApprovedGuideReviews(guideId: string): Promise<GuideReview[]> {
  const trimmed = guideId.trim()
  if (!trimmed) return []

  const fetchReviews = async (client: SupabaseClient) => {
    const { data, error } = await client
      .from("guide_reviews")
      .select("*")
      .eq("guide_id", trimmed)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
    if (error || !data) return []
    return data as GuideReview[]
  }

  try {
    const admin = getSupabaseAdmin()
    const reviews = await fetchReviews(admin)
    if (reviews.length > 0) return reviews
  } catch {
    // fallback
  }

  try {
    return await fetchReviews(getSupabasePublic())
  } catch {
    return []
  }
}

export async function fetchAllGuideReviewsAdmin(): Promise<
  (GuideReview & { guide?: Pick<TourGuide, "id" | "full_name"> })[]
> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("guide_reviews")
    .select("*, tour_guides(id, full_name)")
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return data.map((row) => {
    const guideRow = row.tour_guides as { id: string; full_name: string } | null
    const { tour_guides: _omit, ...review } = row
    return {
      ...(review as GuideReview),
      guide: guideRow ?? undefined,
    }
  })
}

export function buildGuideProfilePath(guide: { id: string; slug?: string | null }) {
  const slug = guide.slug?.trim()
  return `/guides/${slug || guide.id}`
}

export function buildGuideProfileUrl(guide: Pick<TourGuide, "id">) {
  return `https://www.saurahanepal.com${buildGuideProfilePath(guide)}`
}
