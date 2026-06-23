"use client"

import "@uiw/react-md-editor/markdown-editor.css"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import { BLOG_TAGS, type BlogPostRow } from "@/lib/blog-db"
import { slugifyTitle } from "@/lib/blog-slug"
import { isNextOptimizedImageSrc } from "@/lib/image"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

type FormState = {
  title: string
  slug: string
  tag: string
  read_time: string
  excerpt: string
  cover_image: string
  content: string
  author: string
  meta_title: string
  meta_description: string
  status: "draft" | "published"
}

const fieldClass =
  "w-full rounded-[10px] border border-border-brand bg-cream px-3 py-2 text-sm text-text-brand outline-none focus:border-green-mid focus:bg-white"

const defaultForm: FormState = {
  title: "",
  slug: "",
  tag: "Guide",
  read_time: "5 min read",
  excerpt: "",
  cover_image: "",
  content: "",
  author: "Sauraha Nepal Team",
  meta_title: "",
  meta_description: "",
  status: "draft",
}

function formFromPost(post: BlogPostRow): FormState {
  return {
    title: post.title,
    slug: post.slug,
    tag: post.tag ?? "Guide",
    read_time: post.read_time ?? "5 min read",
    excerpt: post.excerpt ?? "",
    cover_image: post.cover_image ?? "",
    content: post.content ?? "",
    author: post.author ?? "Sauraha Nepal Team",
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
    status: post.status === "published" ? "published" : "draft",
  }
}

export default function AdminBlogEditor({ postId }: { postId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(defaultForm)
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(!!postId)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingInline, setUploadingInline] = useState(false)
  const [contentSelection, setContentSelection] = useState({ start: 0, end: 0 })
  const [error, setError] = useState("")

  function syncContentSelection(target: EventTarget & HTMLTextAreaElement) {
    setContentSelection({
      start: target.selectionStart ?? 0,
      end: target.selectionEnd ?? 0,
    })
  }

  function insertImageIntoContent(url: string, alt: string) {
    const snippet = `\n\n![${alt}](${url})\n\n`
    const { start, end } = contentSelection
    const content = form.content
    const insertAt = start >= 0 && start <= content.length ? start : content.length
    const endAt = end >= insertAt && end <= content.length ? end : insertAt
    const next =
      content.slice(0, insertAt) + snippet + content.slice(endAt)
    setForm((prev) => ({ ...prev, content: next }))
    const cursor = insertAt + snippet.length
    setContentSelection({ start: cursor, end: cursor })
  }

  const loadPost = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/blog/${postId}`)
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { post?: BlogPostRow; error?: string }
      if (!res.ok || !data.post) {
        setError(data.error ?? "Post not found.")
        return
      }
      setForm(formFromPost(data.post))
      setSlugManual(true)
    } catch {
      setError("Failed to load post.")
    } finally {
      setLoading(false)
    }
  }, [postId, router])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  async function handleInlineImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setUploadingInline(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("file", file)
      if (postId) formData.set("postId", postId)

      const res = await fetch("/api/admin/blog/upload-inline", {
        method: "POST",
        body: formData,
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to upload image.")
        return
      }
      const alt =
        file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() ||
        form.title.trim() ||
        "Image"
      insertImageIntoContent(data.url, alt)
    } catch {
      setError("Failed to upload image.")
    } finally {
      setUploadingInline(false)
    }
  }

  async function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setUploadingCover(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("file", file)
      if (postId) formData.set("postId", postId)

      const res = await fetch("/api/admin/blog/upload-cover", {
        method: "POST",
        body: formData,
      })
      if (res.status === 401) {
        router.push("/admin")
        return
      }
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to upload cover image.")
        return
      }
      setForm((prev) => ({ ...prev, cover_image: data.url! }))
    } catch {
      setError("Failed to upload cover image.")
    } finally {
      setUploadingCover(false)
    }
  }

  function updateTitle(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugifyTitle(title),
    }))
  }

  async function save(status: "draft" | "published") {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    if (!form.slug.trim()) {
      setError("Slug is required.")
      return
    }

    setSaving(true)
    setError("")
    const payload = { ...form, status }

    try {
      const res = postId
        ? await fetch(`/api/admin/blog/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { error?: string; post?: BlogPostRow }
      if (!res.ok) {
        setError(data.error ?? "Failed to save post.")
        return
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      setError("Failed to save post.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-text-light">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8" data-color-mode="light">
      <Link
        href="/admin/dashboard"
        className="text-sm font-semibold text-green-mid hover:text-green-brand"
      >
        ← Back to blog list
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
        {postId ? "Edit Post" : "New Post"}
      </h1>

      {error && (
        <p className="mt-4 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Title *</label>
          <input
            value={form.title}
            onChange={(e) => updateTitle(e.target.value)}
            className={`${fieldClass} text-lg font-semibold`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true)
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">Tag</label>
            <select
              value={form.tag}
              onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
              className={fieldClass}
            >
              {BLOG_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-mid">Read time</label>
            <input
              value={form.read_time}
              onChange={(e) => setForm((prev) => ({ ...prev, read_time: e.target.value }))}
              className={fieldClass}
              placeholder="5 min read"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">
            Excerpt (max 200 chars)
          </label>
          <textarea
            value={form.excerpt}
            maxLength={200}
            onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            className={`${fieldClass} min-h-[80px]`}
          />
          <p className="mt-1 text-xs text-text-light">{form.excerpt.length}/200</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Cover image</label>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-full bg-green-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-mid">
              {uploadingCover ? "Uploading…" : "Upload cover"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={handleCoverUpload}
                className="hidden"
                disabled={uploadingCover || saving}
              />
            </label>
            <span className="text-xs text-text-light">JPEG, PNG, or WEBP · max 10 MB</span>
          </div>
          <p className="mb-2 text-xs text-text-light">
            Or paste an image URL below (optional if you uploaded a file).
          </p>
          <input
            value={form.cover_image}
            onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))}
            className={fieldClass}
            placeholder="https://… after upload, or /images/…"
          />
          {form.cover_image.trim() && (
            <div className="relative mt-3 h-56 w-full overflow-hidden rounded-xl border border-border-brand">
              <Image
                src={form.cover_image}
                alt="Cover preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
                unoptimized={!isNextOptimizedImageSrc(form.cover_image)}
              />
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-text-mid">Content</label>
            <label className="cursor-pointer rounded-full border border-green-brand bg-white px-4 py-1.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white">
              {uploadingInline ? "Uploading…" : "Insert image in article"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={handleInlineImageUpload}
                className="hidden"
                disabled={uploadingInline || saving}
              />
            </label>
          </div>
          <p className="mb-2 text-xs text-text-light">
            Place the cursor where you want the image, then upload. Markdown{" "}
            <code className="rounded bg-cream px-1">![alt](url)</code> is inserted automatically.
          </p>
          <div className="overflow-hidden rounded-xl border border-border-brand">
            <MDEditor
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value ?? "" }))}
              height={400}
              preview="live"
              textareaProps={{
                onSelect: (e) => syncContentSelection(e.currentTarget),
                onClick: (e) => syncContentSelection(e.currentTarget),
                onKeyUp: (e) => syncContentSelection(e.currentTarget),
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Author</label>
          <input
            value={form.author}
            onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">
            Meta Title (max 60)
          </label>
          <input
            value={form.meta_title}
            maxLength={60}
            onChange={(e) => setForm((prev) => ({ ...prev, meta_title: e.target.value }))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">
            Meta Description (max 160)
          </label>
          <textarea
            value={form.meta_description}
            maxLength={160}
            onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
            className={`${fieldClass} min-h-[80px]`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-mid">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as "draft" | "published",
              }))
            }
            className={fieldClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border-brand pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="cursor-pointer rounded-full border border-border-brand bg-white px-6 py-2.5 text-sm font-semibold text-text-mid hover:bg-cream disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("published")}
            className="cursor-pointer rounded-full bg-green-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-mid disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}
