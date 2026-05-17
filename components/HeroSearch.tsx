"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    router.push(`/listings${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-8 flex max-w-[560px] overflow-hidden rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search hotels, restaurants, activities..."
        className="flex-1 border-none bg-transparent px-6 py-4 font-[family-name:var(--font-nunito)] text-base text-text-brand outline-none"
      />
      <button
        type="submit"
        className="cursor-pointer bg-green-mid px-7 font-semibold text-white transition-colors hover:bg-green-brand"
      >
        Search
      </button>
    </form>
  )
}
