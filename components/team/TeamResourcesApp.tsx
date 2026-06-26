"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import ResourceFileIcon from "@/components/resources/ResourceFileIcon"
import TeamPageHeader from "@/components/team/TeamPageHeader"
import {
  formatResourceDate,
  formatResourceFileSize,
  groupResourcesByCategory,
  resourceFileKind,
  type TeamResourceWithDownload,
} from "@/lib/team-resources"

export default function TeamResourcesApp() {
  const router = useRouter()
  const [resources, setResources] = useState<TeamResourceWithDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  const loadResources = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/team/resources")
      if (res.status === 401) {
        router.push("/team")
        return
      }

      const data = (await res.json()) as {
        resources?: TeamResourceWithDownload[]
        error?: string
      }

      if (!res.ok) {
        setError(data.error ?? "Failed to load resources.")
        return
      }

      const next = data.resources ?? []
      setResources(next)

      const initialOpen: Record<string, boolean> = {}
      for (const group of groupResourcesByCategory(next)) {
        initialOpen[group.category] = true
      }
      setOpenCategories(initialOpen)
    } catch {
      setError("Failed to load resources.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return resources
    return resources.filter((resource) => resource.title.toLowerCase().includes(q))
  }, [resources, search])

  const grouped = useMemo(
    () => groupResourcesByCategory(filteredResources),
    [filteredResources],
  )

  function toggleCategory(category: string) {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  return (
    <div className="min-h-screen bg-cream">
      <TeamPageHeader
        page="resources"
        title="Team Resources"
        subtitle="Training guides, forms and materials for the Sauraha Nepal team"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <label className="block">
          <span className="sr-only">Search resources</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-full rounded-xl border border-border-brand bg-white px-4 py-3 text-sm text-text-brand outline-none focus:border-green-mid"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-orange-brand">
            {error}
          </p>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
              Loading resources…
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
              No resources have been uploaded yet. Check back soon.
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
              No resources match your search.
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => {
                const isOpen = openCategories[group.category] ?? true

                return (
                  <section
                    key={group.category}
                    className="overflow-hidden rounded-2xl border border-border-brand bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.category)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left md:px-6"
                      aria-expanded={isOpen}
                    >
                      <div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                          {group.category}
                        </h2>
                        <p className="mt-0.5 text-sm text-text-light">
                          {group.resources.length} file{group.resources.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-text-mid" aria-hidden>
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border-brand px-4 pb-4 md:px-6 md:pb-6">
                        <ul className="grid gap-3 pt-4 sm:grid-cols-2">
                          {group.resources.map((resource) => (
                            <li
                              key={resource.id}
                              className="flex flex-col rounded-xl border border-border-brand bg-cream/40 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <ResourceFileIcon
                                  kind={resourceFileKind(resource.file_type, resource.file_name)}
                                  className="text-green-brand"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-text-brand">{resource.title}</h3>
                                  {resource.description && (
                                    <p className="mt-1 text-sm text-text-light">
                                      {resource.description}
                                    </p>
                                  )}
                                  <p className="mt-2 text-xs text-text-light">
                                    {formatResourceFileSize(resource.file_size_kb)} ·{" "}
                                    {formatResourceDate(resource.created_at)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={resource.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={resource.file_name}
                                className="btn-primary mt-4 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
                              >
                                Download
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
