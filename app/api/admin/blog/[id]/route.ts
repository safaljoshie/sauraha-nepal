import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import type { BlogPostPayload } from "@/lib/blog-db"
import { deleteBlogPostAdmin, toggleBlogPostStatusAdmin, updateBlogPostAdmin } from "@/lib/blog-admin"
import { fetchBlogPostByIdAdmin } from "@/lib/blog-db"
import { requireAdminApi } from "@/lib/admin-auth"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const post = await fetchBlogPostByIdAdmin(id)
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 })
    }
    return NextResponse.json({ post })
  } catch (error) {
    console.error("Blog fetch error:", error)
    return NextResponse.json({ error: "Failed to load blog post." }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  let payload: BlogPostPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!payload.title?.trim() || !payload.slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 })
  }

  try {
    const existing = await fetchBlogPostByIdAdmin(id)
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 })
    }

    const post = await updateBlogPostAdmin(id, payload, existing.published_at)
    revalidatePath("/blog")
    revalidatePath(`/blog/${existing.slug}`)
    revalidatePath(`/blog/${post.slug}`)
    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Blog update error:", error)
    return NextResponse.json({ error: "Failed to update blog post." }, { status: 500 })
  }
}

export async function PATCH(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const existing = await fetchBlogPostByIdAdmin(id)
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 })
    }

    const post = await toggleBlogPostStatusAdmin(existing)
    revalidatePath("/blog")
    revalidatePath(`/blog/${existing.slug}`)
    revalidatePath(`/blog/${post.slug}`)
    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Blog toggle error:", error)
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const existing = await fetchBlogPostByIdAdmin(id)
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 })
    }

    await deleteBlogPostAdmin(id)
    revalidatePath("/blog")
    revalidatePath(`/blog/${existing.slug}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blog delete error:", error)
    return NextResponse.json({ error: "Failed to delete blog post." }, { status: 500 })
  }
}
