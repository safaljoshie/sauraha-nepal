import { buildGuideInsertRow, type GuideWritePayload } from "@/lib/guide-admin"
import type { GuideService } from "@/lib/tour-guides"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ListGuidePayload = {
  full_name: string
  nickname: string
  photo_url: string
  bio: string
  years_experience: number | null
  location: string
  phone: string
  whatsapp: string
  email: string
  facebook_url: string
  instagram_url: string
  website_url: string
  licence_number: string
  languages: string[]
  expertise: string[]
  services: GuideService[]
  agreed_to_terms: boolean
  id?: string
}

export type ListGuideRecord = ListGuidePayload & {
  status: "pending"
}

export function hasGuideContactEmail(email: string | null | undefined) {
  const trimmed = email?.trim() ?? ""
  return trimmed.length > 0 && EMAIL_RE.test(trimmed)
}

export function validateListGuidePayload(
  body: Partial<ListGuidePayload & GuideWritePayload & { agreed_to_terms?: boolean }>,
): { data: ListGuideRecord | null; error: string | null } {
  const agreed_to_terms = body.agreed_to_terms === true
  if (!agreed_to_terms) {
    return { data: null, error: "You must agree to the terms before submitting." }
  }

  const email = body.email?.trim() ?? ""
  if (!email) {
    return { data: null, error: "Email is required." }
  }
  if (!EMAIL_RE.test(email)) {
    return { data: null, error: "Please enter a valid email address." }
  }

  const languages = Array.isArray(body.languages)
    ? body.languages.filter((v) => typeof v === "string" && v.trim())
    : []
  if (languages.length === 0) {
    return { data: null, error: "Please select at least one language." }
  }

  const services = Array.isArray(body.services) ? body.services : []
  const validServices = services.filter(
    (s) => s && typeof s.name === "string" && s.name.trim() && Number(s.price_npr) >= 0,
  )
  if (validServices.length === 0) {
    return { data: null, error: "Please add at least one service with a price." }
  }

  const built = buildGuideInsertRow({
    full_name: body.full_name,
    nickname: body.nickname,
    photo_url: body.photo_url,
    bio: body.bio,
    years_experience: body.years_experience ?? undefined,
    location: body.location,
    phone: body.phone,
    whatsapp: body.whatsapp,
    email,
    facebook_url: body.facebook_url,
    instagram_url: body.instagram_url,
    website_url: body.website_url,
    licence_number: body.licence_number,
    languages,
    expertise: body.expertise,
    services: validServices,
    status: "pending",
    id: body.id,
  })

  if ("error" in built) {
    return { data: null, error: built.error ?? "Validation failed." }
  }

  const row = built.row
  return {
    data: {
      full_name: row.full_name,
      nickname: row.nickname ?? "",
      photo_url: row.photo_url ?? "",
      bio: row.bio ?? "",
      years_experience: row.years_experience,
      location: row.location ?? "Sauraha, Chitwan",
      phone: row.phone ?? "",
      whatsapp: row.whatsapp ?? "",
      email: row.email ?? "",
      facebook_url: row.facebook_url ?? "",
      instagram_url: row.instagram_url ?? "",
      website_url: row.website_url ?? "",
      licence_number: row.licence_number ?? "",
      languages: row.languages,
      expertise: row.expertise,
      services: row.services as GuideService[],
      agreed_to_terms: true,
      status: "pending",
      ...(body.id?.trim() ? { id: body.id.trim() } : {}),
    },
    error: null,
  }
}
