import { cache } from "react"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

/** URL filter ids: virtual `all` / `info` plus dynamic group slugs from the database. */
export type CategoryGroupId = "all" | "info" | (string & {})

export type CategoryGroupRow = {
  id: string
  created_at: string
  updated_at: string
  slug: string
  label: string
  tab_label: string
  icon: string | null
  sort_order: number
  is_active: boolean
}

export type BusinessCategoryRow = {
  id: string
  created_at: string
  updated_at: string
  name: string
  group_id: string
  sort_order: number
  is_active: boolean
}

export type BuiltCategoryGroup = {
  id: CategoryGroupId
  label: string
  tabLabel: string
  matchers: string[]
  icon?: string | null
  dbId?: string
}

export type CategoryCatalog = {
  groups: CategoryGroupRow[]
  categories: BusinessCategoryRow[]
  builtGroups: BuiltCategoryGroup[]
  categoryNames: string[]
  activeCategoryNames: string[]
}

const DEFAULT_GROUPS: Omit<CategoryGroupRow, "id" | "created_at" | "updated_at">[] = [
  { slug: "stay", label: "Stay", tab_label: "🏨 Stay", icon: "🏨", sort_order: 10, is_active: true },
  {
    slug: "eat",
    label: "Eat & Drink",
    tab_label: "🍽️ Eat & Drink",
    icon: "🍽️",
    sort_order: 20,
    is_active: true,
  },
  {
    slug: "activities",
    label: "Activities",
    tab_label: "🐘 Activities",
    icon: "🐘",
    sort_order: 30,
    is_active: true,
  },
  {
    slug: "transport",
    label: "Transport",
    tab_label: "🚗 Transport",
    icon: "🚗",
    sort_order: 40,
    is_active: true,
  },
  {
    slug: "shopping",
    label: "Shopping",
    tab_label: "🛍️ Shopping",
    icon: "🛍️",
    sort_order: 50,
    is_active: true,
  },
  {
    slug: "guides",
    label: "Tour Guides",
    tab_label: "🧭 Tour Guides",
    icon: "🧭",
    sort_order: 60,
    is_active: true,
  },
]

const DEFAULT_CATEGORY_SEED: { name: string; groupSlug: string; sort_order: number }[] = [
  { name: "Hotel", groupSlug: "stay", sort_order: 10 },
  { name: "Resort", groupSlug: "stay", sort_order: 20 },
  { name: "Guesthouse", groupSlug: "stay", sort_order: 30 },
  { name: "Homestay", groupSlug: "stay", sort_order: 40 },
  { name: "Restaurant", groupSlug: "eat", sort_order: 10 },
  { name: "Cafe", groupSlug: "eat", sort_order: 20 },
  { name: "Bar", groupSlug: "eat", sort_order: 30 },
  { name: "Tea Shop", groupSlug: "eat", sort_order: 40 },
  { name: "Bakery", groupSlug: "eat", sort_order: 50 },
  { name: "Street Food", groupSlug: "eat", sort_order: 60 },
  { name: "Liquor Shop", groupSlug: "eat", sort_order: 70 },
  { name: "Safari", groupSlug: "activities", sort_order: 10 },
  { name: "Canoe/Boat", groupSlug: "activities", sort_order: 20 },
  { name: "Birdwatching", groupSlug: "activities", sort_order: 30 },
  { name: "Cultural Show", groupSlug: "activities", sort_order: 40 },
  { name: "Animal Sanctuary", groupSlug: "activities", sort_order: 50 },
  { name: "Taxi/Jeep", groupSlug: "transport", sort_order: 10 },
  { name: "Bus Service", groupSlug: "transport", sort_order: 20 },
  { name: "Cycle Rental", groupSlug: "transport", sort_order: 30 },
  { name: "Scooty Rental", groupSlug: "transport", sort_order: 40 },
  { name: "Souvenirs", groupSlug: "shopping", sort_order: 10 },
  { name: "Clothing", groupSlug: "shopping", sort_order: 20 },
  { name: "Tattoo Shop", groupSlug: "shopping", sort_order: 30 },
  { name: "Grocery Shop", groupSlug: "shopping", sort_order: 40 },
  { name: "Chemist/Pharmacy", groupSlug: "shopping", sort_order: 50 },
  { name: "Licensed Guide", groupSlug: "guides", sort_order: 10 },
  { name: "Tour Operator", groupSlug: "guides", sort_order: 20 },
]

function makeDefaultCatalog(): { groups: CategoryGroupRow[]; categories: BusinessCategoryRow[] } {
  const now = new Date().toISOString()
  const groups: CategoryGroupRow[] = DEFAULT_GROUPS.map((g, i) => ({
    ...g,
    id: `default-group-${g.slug}`,
    created_at: now,
    updated_at: now,
  }))
  const slugToId = new Map(groups.map((g) => [g.slug, g.id]))
  const categories: BusinessCategoryRow[] = DEFAULT_CATEGORY_SEED.map((c, i) => ({
    id: `default-cat-${i}`,
    created_at: now,
    updated_at: now,
    name: c.name,
    group_id: slugToId.get(c.groupSlug) ?? groups[0].id,
    sort_order: c.sort_order,
    is_active: true,
  }))
  return { groups, categories }
}

export function buildCategoryGroups(
  groups: CategoryGroupRow[],
  categories: BusinessCategoryRow[],
  options?: { includeInactive?: boolean },
): BuiltCategoryGroup[] {
  const includeInactive = options?.includeInactive ?? false
  const activeGroups = includeInactive ? groups : groups.filter((g) => g.is_active)
  const activeCategories = includeInactive
    ? categories
    : categories.filter((c) => c.is_active)

  const byGroup = new Map<string, string[]>()
  for (const cat of activeCategories) {
    const list = byGroup.get(cat.group_id) ?? []
    list.push(cat.name)
    byGroup.set(cat.group_id, list)
  }

  const built: BuiltCategoryGroup[] = [
    { id: "all", label: "All", tabLabel: "All", matchers: [] },
    ...activeGroups
      .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug))
      .map((g) => ({
        id: g.slug as CategoryGroupId,
        label: g.label,
        tabLabel: g.tab_label,
        matchers: byGroup.get(g.id) ?? [],
        icon: g.icon,
        dbId: g.id,
      })),
    { id: "info", label: "Travel Info", tabLabel: "ℹ️ Travel Info", matchers: [] },
  ]

  return built
}

export function assembleCategoryCatalog(
  groups: CategoryGroupRow[],
  categories: BusinessCategoryRow[],
  options?: { includeInactive?: boolean },
): CategoryCatalog {
  const includeInactive = options?.includeInactive ?? false
  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  )
  const categoryNames = sortedCategories.map((c) => c.name)
  const activeCategoryNames = sortedCategories
    .filter((c) => c.is_active)
    .map((c) => c.name)

  return {
    groups,
    categories: sortedCategories,
    builtGroups: buildCategoryGroups(groups, categories, { includeInactive }),
    categoryNames,
    activeCategoryNames,
  }
}

export const DEFAULT_CATEGORY_CATALOG = assembleCategoryCatalog(
  makeDefaultCatalog().groups,
  makeDefaultCatalog().categories,
)

async function loadFromSupabase(includeInactive: boolean) {
  const groupQuery = (client: ReturnType<typeof getSupabasePublic>) => {
    let q = client.from("category_groups").select("*").order("sort_order", { ascending: true })
    if (!includeInactive) q = q.eq("is_active", true)
    return q
  }

  const categoryQuery = (client: ReturnType<typeof getSupabasePublic>) => {
    let q = client
      .from("business_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (!includeInactive) q = q.eq("is_active", true)
    return q
  }

  try {
    const admin = getSupabaseAdmin()
    const [groupsRes, categoriesRes] = await Promise.all([
      groupQuery(admin),
      categoryQuery(admin),
    ])
    if (!groupsRes.error && !categoriesRes.error && groupsRes.data && categoriesRes.data) {
      if (groupsRes.data.length > 0) {
        return {
          groups: groupsRes.data as CategoryGroupRow[],
          categories: categoriesRes.data as BusinessCategoryRow[],
        }
      }
    }
  } catch {
    // fallback below
  }

  try {
    const supabase = getSupabasePublic()
    const [groupsRes, categoriesRes] = await Promise.all([
      groupQuery(supabase),
      categoryQuery(supabase),
    ])
    if (!groupsRes.error && !categoriesRes.error && groupsRes.data && categoriesRes.data) {
      if (groupsRes.data.length > 0) {
        return {
          groups: groupsRes.data as CategoryGroupRow[],
          categories: categoriesRes.data as BusinessCategoryRow[],
        }
      }
    }
  } catch {
    // use defaults
  }

  return null
}

export const fetchCategoryCatalog = cache(async (options?: {
  includeInactive?: boolean
}): Promise<CategoryCatalog> => {
  const includeInactive = options?.includeInactive ?? false
  const loaded = await loadFromSupabase(includeInactive)
  if (!loaded) return DEFAULT_CATEGORY_CATALOG
  return assembleCategoryCatalog(loaded.groups, loaded.categories, { includeInactive })
})

export function isValidCategoryName(
  name: string,
  catalog: CategoryCatalog,
  options?: { includeInactive?: boolean },
) {
  const trimmed = name.trim()
  const list = options?.includeInactive ? catalog.categoryNames : catalog.activeCategoryNames
  return list.includes(trimmed)
}

export function getActiveCategoryNames(catalog: CategoryCatalog) {
  return catalog.activeCategoryNames.length > 0
    ? catalog.activeCategoryNames
    : DEFAULT_CATEGORY_CATALOG.activeCategoryNames
}

export function getGroupSlugSet(catalog: CategoryCatalog) {
  return new Set(catalog.groups.map((g) => g.slug))
}

export const SLUG_RE = /^[a-z0-9-]+$/

export type SearchCategoryChip = { label: string; href: string }

export function buildSearchCategoryChips(catalog: CategoryCatalog): SearchCategoryChip[] {
  const slugLabels: Record<string, string> = {
    stay: "Hotels",
    activities: "Activities",
    eat: "Restaurants",
  }
  const chips: SearchCategoryChip[] = []
  for (const slug of ["stay", "activities", "eat"]) {
    const group = catalog.groups.find((g) => g.slug === slug && g.is_active)
    if (group) {
      chips.push({
        label: slugLabels[slug] ?? group.label,
        href: `/listings?category=${slug}`,
      })
    }
  }
  chips.push({ label: "Travel Guides", href: "/blog" })
  return chips
}

export function buildFooterExploreLinks(catalog: CategoryCatalog): SearchCategoryChip[] {
  const mapping = [
    { slug: "stay", label: "Hotels" },
    { slug: "eat", label: "Restaurants" },
    { slug: "activities", label: "Activities" },
  ]
  const links: SearchCategoryChip[] = []
  for (const { slug, label } of mapping) {
    const group = catalog.groups.find((g) => g.slug === slug && g.is_active)
    if (group) links.push({ href: `/listings?category=${slug}`, label })
  }
  links.push({ href: "/blog", label: "Travel Guides" })
  return links
}

export function getStayListingsHref(catalog: CategoryCatalog) {
  const stay = catalog.groups.find((g) => g.slug === "stay" && g.is_active)
  return stay ? `/listings?category=stay` : "/listings"
}
