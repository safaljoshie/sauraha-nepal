"use client"

import { useMemo, useState, type ReactNode } from "react"
import GuideCard from "@/components/guides/GuideCard"
import {
  EXPERIENCE_FILTER_OPTIONS,
  SPECIALITY_FILTERS,
  guideMatchesMinExperience,
  guideMatchesSpeciality,
  type SpecialityFilterKey,
} from "@/lib/guides-seo"
import {
  collectGuideExpertise,
  collectGuideLanguages,
  type TourGuide,
} from "@/lib/tour-guides"

type SortOption = "rating" | "experience" | "newest"

type GuidesDirectoryProps = {
  guides: TourGuide[]
  intro?: ReactNode
}

const EMPTY_FILTERS = {
  search: "",
  language: "all",
  expertise: "all",
  speciality: "all" as "all" | SpecialityFilterKey,
  experience: "any",
  verifiedOnly: false,
  sort: "rating" as SortOption,
}

export default function GuidesDirectory({ guides, intro }: GuidesDirectoryProps) {
  const [search, setSearch] = useState(EMPTY_FILTERS.search)
  const [language, setLanguage] = useState(EMPTY_FILTERS.language)
  const [expertise, setExpertise] = useState(EMPTY_FILTERS.expertise)
  const [speciality, setSpeciality] = useState<"all" | SpecialityFilterKey>(EMPTY_FILTERS.speciality)
  const [experience, setExperience] = useState(EMPTY_FILTERS.experience)
  const [verifiedOnly, setVerifiedOnly] = useState(EMPTY_FILTERS.verifiedOnly)
  const [sort, setSort] = useState<SortOption>(EMPTY_FILTERS.sort)

  const languageOptions = useMemo(() => collectGuideLanguages(guides), [guides])
  const expertiseOptions = useMemo(() => collectGuideExpertise(guides), [guides])

  const hasActiveFilters =
    search.trim() !== "" ||
    language !== "all" ||
    expertise !== "all" ||
    speciality !== "all" ||
    experience !== "any" ||
    verifiedOnly

  function resetFilters() {
    setSearch(EMPTY_FILTERS.search)
    setLanguage(EMPTY_FILTERS.language)
    setExpertise(EMPTY_FILTERS.expertise)
    setSpeciality(EMPTY_FILTERS.speciality)
    setExperience(EMPTY_FILTERS.experience)
    setVerifiedOnly(EMPTY_FILTERS.verifiedOnly)
    setSort(EMPTY_FILTERS.sort)
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let results = guides.filter((guide) => {
      if (verifiedOnly && !guide.is_verified) return false
      if (language !== "all" && !guide.languages.includes(language)) return false
      if (expertise !== "all" && !guide.expertise.includes(expertise)) return false
      if (speciality !== "all" && !guideMatchesSpeciality(guide, speciality)) return false
      if (!guideMatchesMinExperience(guide, experience)) return false
      if (!query) return true
      const haystack = [
        guide.full_name,
        guide.nickname ?? "",
        guide.bio ?? "",
        guide.location ?? "",
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
  }, [guides, search, language, expertise, speciality, experience, verifiedOnly, sort])

  return (
    <section id="guide-listings" className="scroll-mt-24 site-container py-10 text-center md:py-12">
      <h2 className="sr-only">Browse jungle guides</h2>

      <form
        className="mx-auto max-w-4xl rounded-2xl border border-border-brand bg-white p-4 text-left md:p-5"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Filter jungle guides"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="guide-search" className="sr-only">
              Search by guide name
            </label>
            <input
              id="guide-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by guide name..."
              className="w-full rounded-xl border-[1.5px] border-border-brand px-4 py-2.5 text-sm outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
            />
          </div>

          <div>
            <label htmlFor="guide-language" className="mb-1 block text-xs font-semibold text-text-light">
              Language
            </label>
            <select
              id="guide-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
            >
              <option value="all">All languages</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="guide-speciality" className="mb-1 block text-xs font-semibold text-text-light">
              Speciality
            </label>
            <select
              id="guide-speciality"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value as "all" | SpecialityFilterKey)}
              className="w-full rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
            >
              <option value="all">All specialities</option>
              {SPECIALITY_FILTERS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="guide-experience" className="mb-1 block text-xs font-semibold text-text-light">
              Years of experience
            </label>
            <select
              id="guide-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
            >
              {EXPERIENCE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {expertiseOptions.length > 0 ? (
            <div>
              <label htmlFor="guide-expertise" className="mb-1 block text-xs font-semibold text-text-light">
                Listed expertise
              </label>
              <select
                id="guide-expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
              >
                <option value="all">All listed tags</option>
                {expertiseOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="guide-sort" className="mb-1 block text-xs font-semibold text-text-light">
              Sort by
            </label>
            <select
              id="guide-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full rounded-xl border-[1.5px] border-border-brand bg-white px-4 py-2.5 text-sm text-text-mid outline-none focus:border-green-mid focus-visible:ring-2 focus-visible:ring-green-brand/30"
            >
              <option value="rating">Top rated</option>
              <option value="experience">Most experienced</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-border-brand px-4 py-2.5 text-sm text-text-mid">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border-brand text-green-brand focus:ring-green-brand"
              />
              Verified guides only
            </label>
          </div>
        </div>

        {/* Future filter: match by service name from guide.services when a dedicated services taxonomy is added. */}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-border-brand pt-4">
          <p className="text-sm text-text-light" aria-live="polite">
            {filtered.length} guide{filtered.length === 1 ? "" : "s"} shown
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-green-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-brand"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </form>

      {intro ? <div className="mt-10">{intro}</div> : null}

      <div className="mt-10">
        {guides.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-brand bg-cream px-6 py-16 text-center text-text-mid">
            No guides listed yet — check back soon.
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-brand bg-cream px-6 py-16 text-center text-text-mid">
            No guides match your current filters. Try adjusting your search.
          </p>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
