"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import ResourceFileIcon from "@/components/resources/ResourceFileIcon"
import { teamLibraryDownloadPath, teamLibraryViewPath } from "@/lib/team-library-serve"
import type { TeamLibraryConfig } from "@/lib/team-library-config"
import {
  MAX_LIBRARY_FILE_BYTES,
  formatLibraryDate,
  formatLibraryFileSize,
  groupLibraryByCategory,
  isAllowedLibraryFile,
  libraryFileKind,
  type TeamLibraryItemWithDownload,
} from "@/lib/team-library-shared"

type Toast = { id: number; type: "success" | "error"; message: string }

const fieldClass =
  "w-full rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid"

export default function AdminTeamLibrarySection({ config }: { config: TeamLibraryConfig }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<TeamLibraryItemWithDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>(config.categories[0])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(config.adminApiBase)
      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as {
        resources?: TeamLibraryItemWithDownload[]
        error?: string
      }

      if (!res.ok) {
        setError(data.error ?? config.loadErrorMessage)
        return
      }

      setItems(data.resources ?? [])
    } catch {
      setError(config.loadErrorMessage)
    } finally {
      setLoading(false)
    }
  }, [config.adminApiBase, config.loadErrorMessage, router])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  function resetForm() {
    setTitle("")
    setDescription("")
    setCategory(config.categories[0])
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!isAllowedLibraryFile(file)) {
      showToast("error", "Invalid file. Use PDF, Word, or image files up to 20 MB.")
      event.target.value = ""
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  function uploadWithProgress(formData: FormData) {
    return new Promise<{ ok: boolean; status: number; data: Record<string, unknown> }>(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", config.adminApiBase)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText) as Record<string, unknown>
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data })
          } catch {
            reject(new Error("Invalid server response."))
          }
        }

        xhr.onerror = () => reject(new Error("Upload failed."))
        xhr.send(formData)
      },
    )
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault()

    if (!selectedFile) {
      showToast("error", "Please choose a file to upload.")
      return
    }

    if (!title.trim()) {
      showToast("error", "Title is required.")
      return
    }

    if (!isAllowedLibraryFile(selectedFile)) {
      showToast("error", "Invalid file type or size.")
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("title", title.trim())
    formData.append("description", description.trim())
    formData.append("category", category)

    setUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const result = await uploadWithProgress(formData)

      if (result.status === 401) {
        router.push("/admin")
        return
      }

      if (!result.ok) {
        const message =
          typeof result.data.error === "string" ? result.data.error : "Failed to upload file."
        showToast("error", message)
        return
      }

      showToast("success", config.uploadSuccessMessage)
      resetForm()
      await loadItems()
    } catch {
      showToast("error", "Failed to upload file.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleDelete(item: TeamLibraryItemWithDownload) {
    if (
      !window.confirm(`Delete "${item.title}"? This removes the file from storage permanently.`)
    ) {
      return
    }

    setBusyId(item.id)
    try {
      const res = await fetch(`${config.adminApiBase}/${item.id}`, { method: "DELETE" })
      if (res.status === 401) {
        router.push("/admin")
        return
      }

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        showToast("error", data.error ?? "Failed to delete file.")
        return
      }

      showToast("success", config.deleteSuccessMessage)
      await loadItems()
    } catch {
      showToast("error", "Failed to delete file.")
    } finally {
      setBusyId(null)
    }
  }

  const grouped = groupLibraryByCategory(config.categories, items)

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-green-brand">
          {config.adminTitle}
        </h2>
        <p className="mt-1 text-sm text-text-light">{config.adminDescription}</p>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-border-brand bg-white p-5 md:p-6"
      >
        <h3 className="text-sm font-bold uppercase tracking-wide text-text-light">Upload file</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-text-mid">File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full cursor-pointer rounded-xl border border-border-brand bg-white px-3 py-2.5 text-sm text-text-brand file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-green-brand"
            />
            <p className="mt-1 text-xs text-text-light">
              PDF, Word, or images · max {(MAX_LIBRARY_FILE_BYTES / (1024 * 1024)).toFixed(0)} MB
            </p>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-text-mid">Title</span>
            <input
              type="text"
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={config.titlePlaceholder}
              required
              disabled={uploading}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-text-mid">Category</span>
            <select
              className={fieldClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={uploading}
            >
              {config.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-text-mid">
              Description (optional)
            </span>
            <textarea
              className={`${fieldClass} min-h-[90px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={config.descriptionPlaceholder}
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-green-brand transition-all"
                style={{ width: `${Math.max(uploadProgress, 8)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-light">
              Uploading… {uploadProgress > 0 ? `${uploadProgress}%` : ""}
            </p>
          </div>
        )}

        <div className="mt-5">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary cursor-pointer px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-orange-brand">
          {error}
        </p>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-text-light">
          Uploaded files
        </h3>

        {loading ? (
          <div className="mt-4 rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
            {config.emptyAdminMessage}
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {grouped.map((group) => (
              <section key={group.category}>
                <h4 className="mb-3 font-semibold text-green-brand">{group.category}</h4>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border-brand bg-white p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <ResourceFileIcon
                          kind={libraryFileKind(item.file_type, item.file_name)}
                          className="text-green-brand"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-semibold text-text-brand">{item.title}</h5>
                            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-text-mid">
                              {item.category}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-text-light">{item.description}</p>
                          )}
                          <p className="mt-2 text-xs text-text-light">
                            {item.file_name} · {formatLibraryFileSize(item.file_size_kb)} ·{" "}
                            {formatLibraryDate(item.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={teamLibraryViewPath(config, item.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer rounded-lg border border-border-brand px-3 py-2 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
                        >
                          View
                        </a>
                        <a
                          href={teamLibraryDownloadPath(config, item.id)}
                          download={item.file_name}
                          className="cursor-pointer rounded-lg border border-border-brand px-3 py-2 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={busyId === item.id}
                          className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete 🗑
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success" ? "bg-green-brand text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  )
}
