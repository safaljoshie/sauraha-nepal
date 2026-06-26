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

const NAV_LINKS: Array<{ href: string; page: TeamPageId; label: string }> = [
  { href: "/team/calendar", page: "calendar", label: "📅 Calendar" },
  ...TEAM_LIBRARY_LINKS.map((library) => ({
    href: library.teamPath,
    page: library.teamPage,
    label: `${library.navEmoji} ${library.navLabel}`,
  })),
]

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
      <div className="team-header-wrap mx-auto max-w-7xl">
        <div className="flex items-start gap-3">
          <Image
            src="/one.png"
            alt="Sauraha Nepal"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
          />
          <div className="min-w-0 flex-1">
            <h1 className="team-title">{title}</h1>
            <p className="team-subtitle mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="team-nav-scroll mt-4 flex gap-2 overflow-x-auto pb-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`team-nav-btn border transition-colors ${
                page === link.page
                  ? "border-green-brand bg-green-brand text-white"
                  : "border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className="team-nav-btn border border-border-brand bg-white text-text-mid hover:border-green-mid hover:text-green-brand"
          >
            Main site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="team-nav-btn cursor-pointer border border-border-brand bg-white text-text-mid hover:border-orange-brand hover:text-orange-brand"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
