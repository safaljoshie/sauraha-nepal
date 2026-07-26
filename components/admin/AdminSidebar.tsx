"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import SiteIcon from "@/components/icons/SiteIcon"

export type AdminSection =
  | "site-settings"
  | "edit-contact"
  | "edit-hero"
  | "manage-categories"
  | "blog-posts"
  | "listings"
  | "business-reviews"
  | "tour-guides"
  | "manage-team"
  | "content-calendar"
  | "team-resources"
  | "team-itinerary"
  | "newsletter"
  | "subscribers"
  | "logged-in-accounts"

export type AdminNavItem = { id: AdminSection; label: string; icon: string }
export type AdminNavGroup = {
  id: string
  label: string
  icon: ReactNode
  items: AdminNavItem[]
}

const GlobeIcon = (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const ListIcon = (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
)

const PeopleIcon = (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const MailIcon = (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "website",
    label: "Website",
    icon: GlobeIcon,
    items: [
      { id: "site-settings", label: "Site Settings", icon: "settings" },
      { id: "edit-contact", label: "Edit Contact", icon: "phone" },
      { id: "edit-hero", label: "Edit Hero Video", icon: "video" },
      { id: "manage-categories", label: "Manage Categories", icon: "tag" },
      { id: "blog-posts", label: "Blog Posts", icon: "file-text" },
    ],
  },
  {
    id: "listings",
    label: "Listings",
    icon: ListIcon,
    items: [
      { id: "listings", label: "Listings", icon: "store" },
      { id: "business-reviews", label: "Business Reviews", icon: "star" },
      { id: "tour-guides", label: "Tour Guides", icon: "map-pin" },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: PeopleIcon,
    items: [
      { id: "manage-team", label: "Manage Team", icon: "user" },
      { id: "content-calendar", label: "Content Calendar", icon: "calendar" },
      { id: "team-resources", label: "Team Resources", icon: "folder" },
      { id: "team-itinerary", label: "Team Itinerary", icon: "map" },
    ],
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: MailIcon,
    items: [
      { id: "newsletter", label: "Newsletter", icon: "send" },
      { id: "subscribers", label: "Subscribers", icon: "users" },
      { id: "logged-in-accounts", label: "Logged In Accounts", icon: "shield-check" },
    ],
  },
]

export const ADMIN_SECTION_LOOKUP: Record<
  AdminSection,
  { label: string; groupLabel: string }
> = ADMIN_NAV_GROUPS.reduce(
  (acc, group) => {
    for (const item of group.items) {
      acc[item.id] = { label: item.label, groupLabel: group.label }
    }
    return acc
  },
  {} as Record<AdminSection, { label: string; groupLabel: string }>,
)

function sectionHref(section: AdminSection) {
  return `/admin/dashboard?section=${section}`
}

function SidebarNav({
  active,
  onNavigate,
  onLogout,
}: {
  active: AdminSection
  onNavigate: () => void
  onLogout: () => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggleGroup(groupId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {ADMIN_NAV_GROUPS.map((group) => {
          const hasActive = group.items.some((item) => item.id === active)
          const open = hasActive || !collapsed.has(group.id)
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center gap-2 px-2 pb-1 text-left text-xs font-bold uppercase tracking-wider text-text-light transition-colors hover:text-green-brand"
              >
                <span className="text-green-brand">{group.icon}</span>
                <span className="flex-1">{group.label}</span>
                <span
                  className={`text-text-light transition-transform ${open ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  ›
                </span>
              </button>
              {open && (
                <ul className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.id === active
                    return (
                      <li key={item.id}>
                        <Link
                          href={sectionHref(item.id)}
                          onClick={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-green-brand text-white"
                              : "text-text-mid hover:bg-green-mid/10 hover:text-green-brand"
                          }`}
                        >
                          <SiteIcon
                            name={item.icon}
                            size={16}
                            strokeWidth={2}
                            className={isActive ? "text-white" : "text-text-light"}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-border-brand px-3 py-4">
        <button
          type="button"
          onClick={() => {
            onNavigate()
            onLogout()
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <SiteIcon name="log-out" size={16} strokeWidth={2} className="text-red-600" />
          Logout
        </button>
      </div>
    </div>
  )
}

function SidebarHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-brand px-4 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-brand text-sm font-bold text-white">
        SN
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-[family-name:var(--font-playfair)] text-base font-bold text-green-brand">
          Sauraha Nepal
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-light">Admin</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="cursor-pointer rounded-full p-1 text-2xl leading-none text-text-light hover:text-text-brand"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function AdminSidebar({
  active,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: {
  active: AdminSection
  mobileOpen: boolean
  onCloseMobile: () => void
  onLogout: () => void
}) {
  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-border-brand bg-white md:flex">
        <SidebarHeader />
        <SidebarNav active={active} onNavigate={() => {}} onLogout={onLogout} />
      </aside>

      {/* Mobile: slide-in overlay */}
      {mobileOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white shadow-xl">
            <SidebarHeader onClose={onCloseMobile} />
            <SidebarNav active={active} onNavigate={onCloseMobile} onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  )
}
