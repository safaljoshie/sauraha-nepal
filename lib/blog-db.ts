import { cache } from "react"
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase"

export const BLOG_TAGS = ["Guide", "Transport", "Info", "Tips", "Wildlife", "News"] as const
export type BlogTag = (typeof BLOG_TAGS)[number]

export type BlogPostRow = {
  id: string
  created_at: string
  updated_at: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  tag: string | null
  read_time: string | null
  status: string
  author: string | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
}

export type BlogPostPreview = Pick<
  BlogPostRow,
  "slug" | "title" | "excerpt" | "cover_image" | "tag" | "read_time" | "published_at"
>

export type BlogPostPayload = {
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  tag?: string | null
  read_time?: string | null
  status: "draft" | "published"
  author?: string | null
  meta_title?: string | null
  meta_description?: string | null
}

const BLOG_PREVIEW_COLUMNS =
  "slug, title, excerpt, cover_image, tag, read_time, published_at"

async function fetchPublishedWithClient(
  client: ReturnType<typeof getSupabasePublic>,
  slug?: string,
): Promise<BlogPostRow[] | BlogPostRow | null> {
  if (slug) {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error) throw error
    return (data ?? null) as BlogPostRow | null
  }

  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as BlogPostRow[]
}

async function fetchPublishedPreviewWithClient(
  client: ReturnType<typeof getSupabasePublic>,
  limit?: number,
  excludeSlug?: string,
): Promise<BlogPostPreview[]> {
  let query = client
    .from("blog_posts")
    .select(BLOG_PREVIEW_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })

  if (typeof limit === "number") {
    query = query.limit(limit)
  }

  if (excludeSlug) {
    query = query.neq("slug", excludeSlug)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as BlogPostPreview[]
}

async function countPublishedWithClient(
  client: ReturnType<typeof getSupabasePublic>,
): Promise<number> {
  const { count, error } = await client
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
  if (error) throw error
  return count ?? 0
}

/** Server pages: total published posts for stats/SEO (not limited to preview count). */
export const fetchPublishedBlogPostCount = cache(async (): Promise<number> => {
  try {
    return await countPublishedWithClient(getSupabaseAdmin())
  } catch (adminError) {
    console.error("Published blog count (admin):", adminError)
  }

  try {
    return await countPublishedWithClient(getSupabasePublic())
  } catch (publicError) {
    console.error("Published blog count (public):", publicError)
  }

  return 0
})

/** Server pages: prefer service role so published posts show even if anon RLS is missing. */
export const fetchPublishedBlogPosts = cache(async (): Promise<BlogPostRow[]> => {
  try {
    const rows = await fetchPublishedWithClient(getSupabaseAdmin())
    if (Array.isArray(rows)) return rows
  } catch (adminError) {
    console.error("Published blog fetch (admin):", adminError)
  }

  try {
    const rows = await fetchPublishedWithClient(getSupabasePublic())
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        console.warn(
          "Published blog: anon returned no posts. Run supabase/blog_posts.sql (RLS policy) in Supabase.",
        )
      }
      return rows
    }
  } catch (publicError) {
    console.error("Published blog fetch (public):", publicError)
  }

  return []
})

export type BlogPostSlugEntry = Pick<
  BlogPostRow,
  "slug" | "published_at" | "updated_at"
>

/**
 * Slugs and timestamps only — for the sitemap and generateStaticParams.
 * The full fetch pulls every post's `content` (entire markdown body), which is
 * by far the largest per-call payload in the app.
 */
export const fetchPublishedBlogSlugs = cache(
  async (): Promise<BlogPostSlugEntry[]> => {
    // Construct clients lazily: getSupabaseAdmin() throws when the service-role
    // key is absent, and that must not escape past the anon fallback.
    for (const getClient of [getSupabaseAdmin, getSupabasePublic]) {
      try {
        const { data, error } = await getClient()
          .from("blog_posts")
          .select("slug, published_at, updated_at")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
        if (error) throw error
        if (data) return data as BlogPostSlugEntry[]
      } catch (err) {
        console.error("Published blog slugs:", err)
      }
    }
    return []
  },
)

/** Preview columns only — omit `limit` to fetch every published post. */
export const fetchPublishedBlogPostsPreview = cache(
  async (limit?: number): Promise<BlogPostPreview[]> => {
    try {
      return await fetchPublishedPreviewWithClient(getSupabaseAdmin(), limit)
    } catch (adminError) {
      console.error("Published blog preview (admin):", adminError)
    }

    try {
      return await fetchPublishedPreviewWithClient(getSupabasePublic(), limit)
    } catch (publicError) {
      console.error("Published blog preview (public):", publicError)
    }

    return []
  },
)

export const fetchPublishedBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPostRow | null> => {
    try {
      const row = await fetchPublishedWithClient(getSupabaseAdmin(), slug)
      if (row && !Array.isArray(row)) return row
    } catch (adminError) {
      console.error("Blog post by slug (admin):", adminError)
    }

    try {
      const row = await fetchPublishedWithClient(getSupabasePublic(), slug)
      if (row && !Array.isArray(row)) return row
    } catch (publicError) {
      console.error("Blog post by slug (public):", publicError)
    }

    return null
  },
)

export const fetchRelatedBlogPosts = cache(
  async (currentSlug: string, limit = 2): Promise<BlogPostPreview[]> => {
    try {
      return await fetchPublishedPreviewWithClient(
        getSupabaseAdmin(),
        limit,
        currentSlug,
      )
    } catch (adminError) {
      console.error("Related blog posts (admin):", adminError)
    }

    try {
      return await fetchPublishedPreviewWithClient(
        getSupabasePublic(),
        limit,
        currentSlug,
      )
    } catch (publicError) {
      console.error("Related blog posts (public):", publicError)
    }

    return []
  },
)

export async function fetchAllBlogPostsAdmin(): Promise<BlogPostRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as BlogPostRow[]
}

export async function fetchBlogPostByIdAdmin(id: string): Promise<BlogPostRow | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return (data ?? null) as BlogPostRow | null
}

export function formatBlogDate(iso: string | null | undefined) {
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Index card excerpt — strips draft briefs and falls back to plain content text. */
export function getBlogPostExcerptPreview(
  excerpt: string | null | undefined,
  content: string | null | undefined,
  maxLength = 150,
) {
  let text = excerpt?.trim() ?? ""
  if (text.toLowerCase().startsWith("draft brief:")) {
    text = text.slice("draft brief:".length).trim()
  }
  if (!text && content?.trim()) {
    text = content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#*`_~\[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function getRelatedPublishedPosts(posts: BlogPostRow[], currentSlug: string, limit = 2) {
  return posts.filter((p) => p.slug !== currentSlug).slice(0, limit)
}
