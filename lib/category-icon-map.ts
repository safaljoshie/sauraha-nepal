import {
  Binoculars,
  Car,
  Compass,
  Hotel,
  Info,
  MapPin,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react"

export const CATEGORY_ICON_BY_SLUG: Record<string, LucideIcon> = {
  stay: Hotel,
  eat: Utensils,
  activities: Binoculars,
  transport: Car,
  shopping: ShoppingBag,
  guides: Compass,
  info: Info,
}

/** Curated Lucide names for admin category icon picker. */
export const CATEGORY_ICON_OPTIONS = [
  { value: "hotel", label: "Hotel" },
  { value: "utensils", label: "Utensils" },
  { value: "binoculars", label: "Binoculars" },
  { value: "car", label: "Car" },
  { value: "shopping-bag", label: "Shopping bag" },
  { value: "compass", label: "Compass" },
  { value: "info", label: "Info" },
  { value: "map-pin", label: "Map pin" },
  { value: "tree-pine", label: "Tree" },
  { value: "camera", label: "Camera" },
  { value: "heart", label: "Heart" },
  { value: "sparkles", label: "Sparkles" },
] as const

const LUCIDE_BY_NAME: Record<string, LucideIcon> = {
  hotel: Hotel,
  utensils: Utensils,
  "binoculars": Binoculars,
  car: Car,
  "shopping-bag": ShoppingBag,
  compass: Compass,
  info: Info,
  "map-pin": MapPin,
}

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u

function isEmoji(value: string) {
  return EMOJI_PATTERN.test(value)
}

export function resolveCategoryIcon(
  slug: string,
  storedIcon?: string | null,
): LucideIcon {
  const normalizedSlug = slug.trim().toLowerCase()
  if (storedIcon && !isEmoji(storedIcon)) {
    const byName = LUCIDE_BY_NAME[storedIcon.trim().toLowerCase()]
    if (byName) return byName
  }
  return CATEGORY_ICON_BY_SLUG[normalizedSlug] ?? MapPin
}

export function resolveCategoryIconName(
  slug: string,
  storedIcon?: string | null,
): string {
  if (storedIcon && !isEmoji(storedIcon)) {
    return storedIcon.trim().toLowerCase()
  }
  const defaults: Record<string, string> = {
    stay: "hotel",
    eat: "utensils",
    activities: "binoculars",
    transport: "car",
    shopping: "shopping-bag",
    guides: "compass",
    info: "info",
  }
  return defaults[slug.trim().toLowerCase()] ?? "map-pin"
}
