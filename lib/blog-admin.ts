import type { BlogPostPayload, BlogPostRow } from "@/lib/blog-db"
import { getSupabaseAdmin } from "@/lib/supabase"

function normalizePayload(payload: BlogPostPayload) {
  const status = payload.status === "published" ? "published" : "draft"
  const now = new Date().toISOString()
  return {
    title: payload.title.trim(),
    slug: payload.slug.trim(),
    excerpt: payload.excerpt?.trim() || null,
    content: payload.content?.trim() || null,
    cover_image: payload.cover_image?.trim() || null,
    tag: payload.tag?.trim() || null,
    read_time: payload.read_time?.trim() || null,
    status,
    author: payload.author?.trim() || "Sauraha Nepal Team",
    meta_title: payload.meta_title?.trim() || null,
    meta_description: payload.meta_description?.trim() || null,
    published_at: status === "published" ? now : null,
  }
}

export async function createBlogPostAdmin(payload: BlogPostPayload): Promise<BlogPostRow> {
  const supabase = getSupabaseAdmin()
  const row = normalizePayload(payload)
  const { data, error } = await supabase.from("blog_posts").insert(row).select("*").single()
  if (error || !data) throw error ?? new Error("Failed to create post")
  return data as BlogPostRow
}

export async function updateBlogPostAdmin(
  id: string,
  payload: BlogPostPayload,
  existingPublishedAt: string | null,
): Promise<BlogPostRow> {
  const supabase = getSupabaseAdmin()
  const base = normalizePayload(payload)
  const published_at =
    base.status === "published"
      ? existingPublishedAt ?? new Date().toISOString()
      : null

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...base, published_at })
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) throw error ?? new Error("Failed to update post")
  return data as BlogPostRow
}

export async function deleteBlogPostAdmin(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) throw error
}

export async function toggleBlogPostStatusAdmin(post: BlogPostRow): Promise<BlogPostRow> {
  const nextStatus = post.status === "published" ? "draft" : "published"
  const payload: BlogPostPayload = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.cover_image,
    tag: post.tag,
    read_time: post.read_time,
    status: nextStatus,
    author: post.author,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
  }
  return updateBlogPostAdmin(post.id, payload, post.published_at)
}
