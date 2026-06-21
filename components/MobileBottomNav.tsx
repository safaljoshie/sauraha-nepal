"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import ChatAssistantAvatar from "@/components/chat/ChatAssistantAvatar"
import { useChatUI } from "@/components/ChatUIProvider"
import {
  parseListingsNavMode,
  pushListingsNav,
  type ListingsNavMode,
} from "@/lib/listings-mobile-nav"
import { useClientSearchParams } from "@/lib/use-client-search-params"

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

const LISTINGS_MODES = {
  explore: "/listings",
  map: "/listings?view=map",
  search: "/listings?search=true",
} as const satisfies Record<ListingsNavMode, string>

type NavItemId = "home" | ListingsNavMode | "dhurbe" | null

function NavIconButton({
  active,
  label,
  onClick,
  children,
  className = "",
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  const itemClass = `mobile-bottom-nav-item${active ? " mobile-bottom-nav-item--active" : ""}${className ? ` ${className}` : ""}`

  return (
    <button type="button" className={itemClass} aria-label={label} onClick={onClick} aria-current={active ? "page" : undefined}>
      {children}
    </button>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { search } = useClientSearchParams()
  const { open, unread, closeChat, toggleChat } = useChatUI()
  const [pendingId, setPendingId] = useState<NavItemId>(null)

  const onListingsIndex = pathname === "/listings"
  const listingsMode = onListingsIndex ? parseListingsNavMode(search) : null

  useEffect(() => {
    router.prefetch("/")
    router.prefetch(LISTINGS_MODES.explore)
    router.prefetch(LISTINGS_MODES.map)
    router.prefetch(LISTINGS_MODES.search)
  }, [router])

  const activeId: NavItemId = (() => {
    if (pendingId) return pendingId
    if (open) return "dhurbe"
    if (pathname === "/") return "home"
    if (onListingsIndex && listingsMode) return listingsMode
    if (pathname === "/listings" || pathname.startsWith("/listings/")) return "explore"
    return null
  })()

  function closeChatIfOpen() {
    if (open) closeChat()
  }

  function clearPendingSoon() {
    window.requestAnimationFrame(() => setPendingId(null))
  }

  function handleHome() {
    setPendingId("home")
    closeChatIfOpen()
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      clearPendingSoon()
      return
    }
    router.push("/")
    clearPendingSoon()
  }

  function handleListingsMode(mode: ListingsNavMode) {
    setPendingId(mode)
    closeChatIfOpen()

    if (onListingsIndex) {
      pushListingsNav(mode)
      clearPendingSoon()
      return
    }

    router.push(LISTINGS_MODES[mode])
    clearPendingSoon()
  }

  function handleToggleChat() {
    setPendingId("dhurbe")
    toggleChat()
    clearPendingSoon()
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <ul className="mobile-bottom-nav-list">
        <li>
          <NavIconButton active={activeId === "home"} label="Home" onClick={handleHome}>
            <IconHome />
          </NavIconButton>
        </li>
        <li>
          <NavIconButton
            active={activeId === "explore"}
            label="Explore"
            onClick={() => handleListingsMode("explore")}
          >
            <IconExplore />
          </NavIconButton>
        </li>
        <li>
          <NavIconButton active={activeId === "map"} label="Map" onClick={() => handleListingsMode("map")}>
            <IconMap />
          </NavIconButton>
        </li>
        <li>
          <NavIconButton
            active={activeId === "search"}
            label="Search"
            onClick={() => handleListingsMode("search")}
          >
            <IconSearch />
          </NavIconButton>
        </li>
        <li>
          <NavIconButton
            active={activeId === "dhurbe"}
            label={open ? "Close Dhurbe" : "Chat with Dhurbe"}
            onClick={handleToggleChat}
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
