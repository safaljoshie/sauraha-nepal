"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ITINERARY_LIBRARY_CONFIG,
  RESOURCE_LIBRARY_CONFIG,
  type TeamPageId,
} from "@/lib/team-library-config"

const TEAM_LIBRARY_LINKS = [RESOURCE_LIBRARY_CONFIG, ITINERARY_LIBRARY_CONFIG]

type TeamPageHeaderProps = {
  page: TeamPageId
  title: string
  subtitle: string
}

export default function TeamPageHeader({ page, title, subtitle }: TeamPageHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/team/logout", { method: "POST" })
    router.push("/team")
    router.refresh()
  }

  return (
    <header className="border-b border-border-brand bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/one.png"
              alt="Sauraha Nepal"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
                {title}
              </h1>
              <p className="text-sm text-text-light">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/team/calendar"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  page === "calendar"
                    ? "border-green-brand bg-green-brand text-white"
                    : "border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
                }`}
              >
                📅 Calendar
              </Link>
              {TEAM_LIBRARY_LINKS.map((library) => (
                <Link
                  key={library.id}
                  href={library.teamPath}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    page === library.teamPage
                      ? "border-green-brand bg-green-brand text-white"
                      : "border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
                  }`}
                >
                  {library.navEmoji} {library.navLabel}
                </Link>
              ))}
            </nav>
            <Link
              href="/"
              className="rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:border-green-mid hover:text-green-brand"
            >
              Main site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-border-brand bg-white px-4 py-2 text-sm font-semibold text-text-mid hover:border-orange-brand hover:text-orange-brand"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
