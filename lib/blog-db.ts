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

export async function fetchPublishedBlogPosts(): Promise<BlogPostRow[]> {
  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })

    if (!error && data) return data as BlogPostRow[]
  } catch {
    // fallback
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
    if (error || !data) return []
    return data as BlogPostRow[]
  } catch {
    return []
  }
}

export async function fetchPublishedBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
  try {
    const supabase = getSupabasePublic()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (!error && data) return data as BlogPostRow
  } catch {
    // fallback
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error || !data) return null
    return data as BlogPostRow
  } catch {
    return null
  }
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
