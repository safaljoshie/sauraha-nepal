import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import type { BlogPostPayload } from "@/lib/blog-db"
import { createBlogPostAdmin } from "@/lib/blog-admin"
import { fetchAllBlogPostsAdmin } from "@/lib/blog-db"
import { requireAdminApi } from "@/lib/admin-auth"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const posts = await fetchAllBlogPostsAdmin()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Blog list error:", error)
    return NextResponse.json({ error: "Failed to load blog posts." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

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
    const post = await createBlogPostAdmin(payload)
    revalidatePath("/blog")
    if (post.status === "published") {
      revalidatePath(`/blog/${post.slug}`)
    }
    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Blog create error:", error)
    return NextResponse.json({ error: "Failed to create blog post." }, { status: 500 })
  }
}
