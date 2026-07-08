import type { GuideService } from "@/lib/tour-guides"

export type GuideWritePayload = {
  full_name?: string
  nickname?: string
  photo_url?: string
  bio?: string
  years_experience?: number | string
  location?: string
  phone?: string
  whatsapp?: string
  email?: string
  facebook_url?: string
  instagram_url?: string
  website_url?: string
  licence_number?: string
  licence_verified?: boolean
  is_verified?: boolean
  languages?: string[]
  expertise?: string[]
  services?: GuideService[]
  status?: string
  meta_title?: string
  meta_description?: string
  id?: string
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))]
}

function normalizeServices(value: unknown): GuideService[] {
  if (!Array.isArray(value)) return []
  const services: GuideService[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const name = typeof record.name === "string" ? record.name.trim() : ""
    const price = Number(record.price_npr)
    if (!name || !Number.isFinite(price) || price < 0) continue
    const description =
      typeof record.description === "string" ? record.description.trim() : undefined
    services.push({
      name,
      price_npr: Math.round(price),
      ...(description ? { description } : {}),
    })
  }
  return services
}

export function buildGuideInsertRow(payload: GuideWritePayload) {
  const fullName = payload.full_name?.trim() ?? ""
  if (!fullName) {
    return { error: "Full name is required." as const }
  }

  const bio = payload.bio?.trim() ?? ""
  if (!bio) {
    return { error: "Bio is required." as const }
  }

  const phone = payload.phone?.trim() ?? ""
  if (!phone) {
    return { error: "Phone is required." as const }
  }

  const yearsRaw = payload.years_experience
  const years =
    yearsRaw === "" || yearsRaw === undefined || yearsRaw === null
      ? null
      : Number(yearsRaw)

  if (years !== null && (!Number.isFinite(years) || years < 0)) {
    return { error: "Years of experience must be a valid number." as const }
  }

  const status = payload.status?.trim() || "pending"
  if (!["pending", "approved", "rejected"].includes(status)) {
    return { error: "Invalid status." as const }
  }

  return {
    row: {
      ...(payload.id?.trim() ? { id: payload.id.trim() } : {}),
      full_name: fullName,
      nickname: payload.nickname?.trim() || null,
      photo_url: payload.photo_url?.trim() || null,
      bio,
      years_experience: years,
      location: payload.location?.trim() || "Sauraha, Chitwan",
      phone,
      whatsapp: payload.whatsapp?.trim() || null,
      email: payload.email?.trim() || null,
      facebook_url: payload.facebook_url?.trim() || null,
      instagram_url: payload.instagram_url?.trim() || null,
      website_url: payload.website_url?.trim() || null,
      licence_number: payload.licence_number?.trim() || null,
      licence_verified: payload.licence_verified === true,
      languages: normalizeStringArray(payload.languages),
      expertise: normalizeStringArray(payload.expertise),
      services: normalizeServices(payload.services),
      status,
      meta_title: payload.meta_title?.trim() || null,
      meta_description: payload.meta_description?.trim() || null,
      updated_at: new Date().toISOString(),
    },
  }
}

export function buildGuideUpdateRow(payload: GuideWritePayload) {
  const built = buildGuideInsertRow(payload)
  if ("error" in built) return built
  return { row: built.row }
}
