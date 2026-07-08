"use client"

import { useMemo, useState } from "react"
import GuideCard from "@/components/guides/GuideCard"
import {
  collectGuideExpertise,
  collectGuideLanguages,
  type TourGuide,
} from "@/lib/tour-guides"

type SortOption = "rating" | "experience" | "newest"

type GuidesDirectoryProps = {
  guides: TourGuide[]
}

export default function GuidesDirectory({ guides }: GuidesDirectoryProps) {
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState("all")
  const [expertise, setExpertise] = useState("all")
  const [sort, setSort] = useState<SortOption>("rating")

  const languageOptions = useMemo(() => collectGuideLanguages(guides), [guides])
  const expertiseOptions = useMemo(() => collectGuideExpertise(guides), [guides])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let results = guides.filter((guide) => {
      if (language !== "all" && !guide.languages.includes(language)) return false
      if (expertise !== "all" && !guide.expertise.includes(expertise)) return false
      if (!query) return true
      const haystack = [
        guide.full_name,
        guide.nickname ?? "",
        guide.bio ?? "",
        ...guide.languages,
        ...guide.expertise,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })

    results = [...results].sort((a, b) => {
      if (sort === "experience") {
        return (b.years_experience ?? 0) - (a.years_experience ?? 0)
      }
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (b.avg_rating !== a.avg_rating) return b.avg_rating - a.avg_rating
      return b.review_count - a.review_count
    })

    return results
  }, [guides, search, language, expertise, sort])

  return (
    <section className="site-container py-12">
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border-brand bg-white p-4 md:flex-row md:flex-wrap md:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or expertise..."
          className="min-w-0 flex-1 rounded-xl border-[1.5px] border-border-brand px-4 py-2.5 text-sm outline-none focus:border-green-mid"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
          aria-label="Filter by language"
        >
          <option value="all">All languages</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <select
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          className="rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
          aria-label="Filter by expertise"
        >
          <option value="all">All expertise</option>
          {expertiseOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid"
          aria-label="Sort guides"
        >
          <option value="rating">Top Rated</option>
          <option value="experience">Most Experienced</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {guides.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-brand bg-cream px-6 py-16 text-center text-text-mid">
          No guides listed yet — check back soon.
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-brand bg-cream px-6 py-16 text-center text-text-mid">
          No guides match your filters. Try adjusting your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </section>
  )
}
