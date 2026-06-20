"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { type ReactNode } from "react"
import ChatAssistantAvatar from "@/components/chat/ChatAssistantAvatar"
import { useChatUI } from "@/components/ChatUIProvider"

const ICON_PROPS = {
  width: 24,
  height: 24,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function IconHome() {
  return (
    <svg {...ICON_PROPS} viewBox="0 0 24 24" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function IconExplore() {
  return (
    <svg {...ICON_PROPS} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg {...ICON_PROPS} viewBox="0 0 24 24" aria-hidden>
      <polygon points="3,11 22,2 13,21 11,13 3,11" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg {...ICON_PROPS} viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const NAV_ITEMS = [
  { id: "home", href: "/", label: "Home", icon: IconHome },
  { id: "explore", href: "/listings", label: "Explore", icon: IconExplore },
  { id: "map", href: "/listings?view=map", label: "Map", icon: IconMap },
  { id: "search", href: "/listings?search=true", label: "Search", icon: IconSearch },
] as const

type NavItemId = (typeof NAV_ITEMS)[number]["id"] | "dhurbe" | null

function NavIconButton({
  active,
  label,
  href,
  onClick,
  children,
  className = "",
}: {
  active: boolean
  label: string
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  const itemClass = `mobile-bottom-nav-item${active ? " mobile-bottom-nav-item--active" : ""}${className ? ` ${className}` : ""}`

  if (href) {
    return (
      <Link href={href} className={itemClass} aria-label={label} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={itemClass} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { open, unread, toggleChat } = useChatUI()

  const view = searchParams.get("view")
  const searchFlag = searchParams.get("search")
  const onListingsIndex = pathname === "/listings"

  const activeId: NavItemId = (() => {
    if (open) return "dhurbe"
    if (pathname === "/") return "home"
    if (onListingsIndex && view === "map") return "map"
    if (onListingsIndex && searchFlag === "true") return "search"
    if (pathname === "/listings" || pathname.startsWith("/listings/")) return "explore"
    return null
  })()

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <ul className="mobile-bottom-nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <NavIconButton active={activeId === item.id} label={item.label} href={item.href}>
                <Icon />
              </NavIconButton>
            </li>
          )
        })}
        <li>
          <NavIconButton
            active={activeId === "dhurbe"}
            label={open ? "Close Dhurbe" : "Chat with Dhurbe"}
            onClick={toggleChat}
            className="mobile-bottom-nav-dhurbe"
          >
            <span className="mobile-bottom-nav-dhurbe-inner">
              {open ? (
                <svg
                  width={20}
                  height={20}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <ChatAssistantAvatar variant="launcher" />
              )}
              {!open && unread ? (
                <span className="mobile-bottom-nav-dhurbe-badge" aria-hidden>
                  1
                </span>
              ) : null}
            </span>
          </NavIconButton>
        </li>
      </ul>
    </nav>
  )
}
