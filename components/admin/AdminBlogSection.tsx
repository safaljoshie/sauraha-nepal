"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { BlogPostRow } from "@/lib/blog-db"

type Toast = { id: string; type: "success" | "error"; message: string }

function statusBadge(status: string) {
  if (status === "published") {
    return "bg-green-mid/15 text-green-brand"
  }
  return "bg-gray-200 text-gray-700"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function AdminBlogSection() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(type: Toast["type"], message: string) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/blog")
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { posts?: BlogPostRow[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Failed to load blog posts.")
        return
      }
      setPosts(data.posts ?? [])
    } catch {
      setError("Failed to load blog posts.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  async function handleToggle(post: BlogPostRow) {
    setActionId(post.id)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "PATCH" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { post?: BlogPostRow; error?: string }
      if (!res.ok || !data.post) {
        showToast("error", data.error ?? "Failed to update status.")
        return
      }
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post! : p)))
      showToast("success", data.post.status === "published" ? "Post published" : "Post unpublished")
    } catch {
      showToast("error", "Failed to update status.")
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(post: BlogPostRow) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return

    setActionId(post.id)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      if (!res.ok) {
        showToast("error", "Failed to delete post.")
        return
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      showToast("success", "Post deleted")
    } catch {
      showToast("error", "Failed to delete post.")
    } finally {
      setActionId(null)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
            Blog Posts
          </h2>
          <p className="mt-1 text-sm text-text-light">Create and manage travel guides</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-green-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-mid"
        >
          New Post
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-[10px] border border-orange-brand/30 bg-orange-brand/10 px-4 py-3 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand bg-cream/80 text-xs font-bold uppercase tracking-wide text-text-light">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-light">
                    Loading posts…
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-light">
                    No blog posts yet. Create your first post.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-border-brand/60 hover:bg-cream/40">
                    <td className="px-4 py-3 font-semibold text-text-brand">{post.title}</td>
                    <td className="px-4 py-3 text-text-mid">{post.tag ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge(post.status)}`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-light">
                      {formatDate(post.published_at ?? post.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          title="Edit"
                          className="rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          ✏️
                        </Link>
                        <button
                          type="button"
                          title={post.status === "published" ? "Unpublish" : "Publish"}
                          disabled={actionId === post.id}
                          onClick={() => handleToggle(post)}
                          className="cursor-pointer rounded-lg bg-green-100 px-2 py-1 text-sm text-green-700 hover:bg-green-200 disabled:opacity-40"
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={actionId === post.id}
                          onClick={() => handleDelete(post)}
                          className="cursor-pointer rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200 disabled:opacity-40"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.type === "success" ? "bg-green-brand" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  )
}
