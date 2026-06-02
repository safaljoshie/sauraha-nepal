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

/** Server pages: prefer service role so published posts show even if anon RLS is missing. */
export async function fetchPublishedBlogPosts(): Promise<BlogPostRow[]> {
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
}

export async function fetchPublishedBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
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
}

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

export function getRelatedPublishedPosts(posts: BlogPostRow[], currentSlug: string, limit = 2) {
  return posts.filter((p) => p.slug !== currentSlug).slice(0, limit)
}
