import { parsePhotoLinkLines, photoLimitForPlan } from "@/lib/list-business-photos"

export type ListingPlan = "basic" | "featured" | "premium"

export type ListBusinessPayload = {
  business_name: string
  category: string
  description: string
  price_range: string
  opening_hours: string
  owner_name: string
  email: string
  phone: string
  whatsapp: string
  website: string
  facebook: string
  address: string
  google_maps_link: string
  photo_links: string
  plan: ListingPlan
  agreed_to_terms: boolean
}

export type ListBusinessRecord = ListBusinessPayload & {
  status: "pending"
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePlan(plan: string | undefined): ListingPlan | null {
  const value = plan?.trim().toLowerCase()
  if (value === "basic" || value === "featured" || value === "premium") {
    return value
  }
  return null
}

export function planDisplayLabel(plan: ListingPlan) {
  switch (plan) {
    case "basic":
      return "Basic (Free)"
    case "featured":
      return "Featured (NPR 5,000/yr)"
    case "premium":
      return "Premium (NPR 12,000/yr)"
  }
}

export function isPaidPlan(plan: ListingPlan) {
  return plan === "featured" || plan === "premium"
}

export function validateListBusinessPayload(
  body: Partial<ListBusinessPayload>,
): { data: ListBusinessRecord | null; error: string | null } {
  const business_name = body.business_name?.trim() ?? ""
  const category = body.category?.trim() ?? ""
  const description = body.description?.trim() ?? ""
  const price_range = body.price_range?.trim() ?? ""
  const opening_hours = body.opening_hours?.trim() ?? ""
  const owner_name = body.owner_name?.trim() ?? ""
  const email = body.email?.trim() ?? ""
  const phone = body.phone?.trim() ?? ""
  const whatsapp = body.whatsapp?.trim() ?? ""
  const website = body.website?.trim() ?? ""
  const facebook = body.facebook?.trim() ?? ""
  const address = body.address?.trim() ?? ""
  const google_maps_link = body.google_maps_link?.trim() ?? ""
  const photo_links = body.photo_links?.trim() ?? ""
  const plan = normalizePlan(body.plan)
  const agreed_to_terms = body.agreed_to_terms === true

  if (!business_name) {
    return { data: null, error: "Business name is required." }
  }
  if (!category) {
    return { data: null, error: "Category is required." }
  }
  if (!description) {
    return { data: null, error: "Description is required." }
  }
  if (!owner_name) {
    return { data: null, error: "Owner name is required." }
  }
  if (!email) {
    return { data: null, error: "Email is required." }
  }
  if (!EMAIL_RE.test(email)) {
    return { data: null, error: "Please provide a valid email address." }
  }
  if (!phone) {
    return { data: null, error: "Phone number is required." }
  }
  if (!address) {
    return { data: null, error: "Address is required." }
  }
  if (!plan) {
    return { data: null, error: "Please select a valid listing plan." }
  }
  if (!agreed_to_terms) {
    return { data: null, error: "You must agree to the listing terms." }
  }

  if (plan) {
    const photoCount = parsePhotoLinkLines(photo_links).length
    const limit = photoLimitForPlan(plan)
    if (photoCount > limit) {
      return {
        data: null,
        error: `You can include at most ${limit} photo${limit === 1 ? "" : "s"} on the ${plan} plan.`,
      }
    }
  }

  return {
    data: {
      business_name,
      category,
      description,
      price_range,
      opening_hours,
      owner_name,
      email,
      phone,
      whatsapp,
      website,
      facebook,
      address,
      google_maps_link,
      photo_links,
      plan,
      agreed_to_terms,
      status: "pending",
    },
    error: null,
  }
}

export function planFromFormName(name: string): ListingPlan {
  switch (name) {
    case "Featured":
      return "featured"
    case "Premium":
      return "premium"
    default:
      return "basic"
  }
}
