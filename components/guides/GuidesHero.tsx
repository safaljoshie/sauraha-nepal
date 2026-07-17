"use client"

import Link from "next/link"

export default function GuidesHero() {
  function scrollToListings() {
    document.getElementById("guide-listings")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <header className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-6 py-16 text-center text-white md:px-8 md:py-20">
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="section-label text-center text-orange-light">Chitwan National Park</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
          Find Verified Jungle Guides in Sauraha
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/85 md:text-lg">
          Explore Chitwan National Park safely with experienced local jungle guides, wildlife
          naturalists and bird-watching experts. Compare local guides, view their experience and
          contact them directly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={scrollToListings}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-brand transition-colors hover:bg-white/90"
          >
            Browse Jungle Guides
          </button>
          <Link
            href="/list-your-guide"
            className="inline-flex items-center justify-center rounded-xl border border-white/70 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            List Your Guide Profile
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/75">Local knowledge • Wildlife experience • Direct contact</p>
      </div>
    </header>
  )
}
