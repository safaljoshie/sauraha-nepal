"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import ResourceFileIcon from "@/components/resources/ResourceFileIcon"
import TeamPageHeader from "@/components/team/TeamPageHeader"
import type { TeamLibraryConfig } from "@/lib/team-library-config"
import {
  formatLibraryDate,
  formatLibraryFileSize,
  groupLibraryByCategory,
  libraryFileKind,
  type TeamLibraryItemWithDownload,
} from "@/lib/team-library-shared"

export default function TeamLibraryApp({ config }: { config: TeamLibraryConfig }) {
  const router = useRouter()
  const [items, setItems] = useState<TeamLibraryItemWithDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(config.teamApiPath)
      if (res.status === 401) {
        router.push("/team")
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
  }, [config.loadErrorMessage, config.teamApiPath, router])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.title.toLowerCase().includes(q))
  }, [items, search])

  const grouped = useMemo(
    () => groupLibraryByCategory(config.categories, filteredItems),
    [config.categories, filteredItems],
  )

  function toggleCategory(category: string) {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  return (
    <div className="min-h-screen bg-cream">
      <TeamPageHeader
        page={config.teamPage}
        title={config.teamTitle}
        subtitle={config.teamSubtitle}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <label className="block">
          <span className="sr-only">Search {config.itemLabelPlural}</span>
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
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
              {config.emptyTeamMessage}
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-6 py-12 text-center text-text-light">
              {config.emptySearchMessage}
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
                          {group.items.length} file{group.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-text-mid" aria-hidden>
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border-brand px-4 pb-4 md:px-6 md:pb-6">
                        <ul className="grid gap-3 pt-4 sm:grid-cols-2">
                          {group.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex flex-col rounded-xl border border-border-brand bg-cream/40 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <ResourceFileIcon
                                  kind={libraryFileKind(item.file_type, item.file_name)}
                                  className="text-green-brand"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-text-brand">{item.title}</h3>
                                  {item.description && (
                                    <p className="mt-1 text-sm text-text-light">{item.description}</p>
                                  )}
                                  <p className="mt-2 text-xs text-text-light">
                                    {formatLibraryFileSize(item.file_size_kb)} ·{" "}
                                    {formatLibraryDate(item.created_at)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={item.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={item.file_name}
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
