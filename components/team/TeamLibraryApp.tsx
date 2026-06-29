"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import ResourceFileIcon from "@/components/resources/ResourceFileIcon"
import TeamPageHeader from "@/components/team/TeamPageHeader"
import TeamShell from "@/components/team/TeamShell"
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
    <TeamShell>
      <TeamPageHeader
        page={config.teamPage}
        title={config.teamTitle}
        subtitle={config.teamSubtitle}
      />

      <main className="team-main">
        <label className="block">
          <span className="sr-only">Search {config.itemLabelPlural}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="team-input"
          />
        </label>

        {error && (
          <p role="alert" className="team-body-text mt-4 font-semibold text-orange-brand">
            {error}
          </p>
        )}

        <div className="mt-5 sm:mt-6">
          {loading ? (
            <div className="rounded-2xl border border-border-brand bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
              <p className="team-empty-state">Loading…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
              <p className="team-empty-state">{config.emptyTeamMessage}</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-2xl border border-border-brand bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
              <p className="team-empty-state">{config.emptySearchMessage}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3.5 text-left sm:px-5 sm:py-4"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <h2 className="team-section-title">{group.category}</h2>
                        <p className="team-meta mt-0.5">
                          {group.items.length} file{group.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="team-meta shrink-0 font-semibold" aria-hidden>
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border-brand px-3 pb-3 sm:px-5 sm:pb-5">
                        <ul className="grid gap-3 pt-3 sm:grid-cols-2 sm:pt-4">
                          {group.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex flex-col rounded-xl border border-border-brand bg-cream/40 p-3 sm:p-4"
                            >
                              <div className="flex items-start gap-2.5 sm:gap-3">
                                <ResourceFileIcon
                                  kind={libraryFileKind(item.file_type, item.file_name)}
                                  className="h-8 w-8 shrink-0 text-green-brand sm:h-10 sm:w-10"
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="team-card-title">{item.title}</h3>
                                  {item.description && (
                                    <p className="team-body-text mt-1">{item.description}</p>
                                  )}
                                  <p className="team-meta mt-2">
                                    {formatLibraryFileSize(item.file_size_kb)} ·{" "}
                                    {formatLibraryDate(item.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row">
                                {item.view_url && (
                                  <a
                                    href={item.view_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="team-action-btn w-full rounded-xl border border-border-brand bg-white px-4 py-2.5 text-center text-sm font-semibold text-text-brand transition-colors hover:border-green-mid hover:bg-cream sm:flex-1"
                                  >
                                    View
                                  </a>
                                )}
                                <a
                                  href={item.download_url}
                                  download={item.file_name}
                                  className="btn-primary team-action-btn w-full sm:flex-1"
                                >
                                  Download
                                </a>
                              </div>
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
    </TeamShell>
  )
}
