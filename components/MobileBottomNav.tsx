"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, type ReactNode } from "react"

const ICON_PROPS = {
  width: 24,
  height: 24,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
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

function IconChevron() {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const MENU_ITEMS = [
  {
    href: "/about",
    label: "About us",
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    href: "/list-your-business",
    label: "List your business",
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    href: "/blog",
    label: "Blog",
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    href: "/listings?view=map",
    label: "View map",
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24" aria-hidden>
        <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
] as const

const NAV_ITEMS = [
  { id: "home", href: "/", label: "Home", icon: IconHome },
  { id: "explore", href: "/listings", label: "Explore", icon: IconExplore },
  { id: "map", href: "/listings?view=map", label: "Map", icon: IconMap },
  { id: "search", href: "/listings?search=true", label: "Search", icon: IconSearch },
] as const

type NavItemId = (typeof NAV_ITEMS)[number]["id"] | "menu"

function NavIconButton({
  active,
  label,
  href,
  onClick,
  children,
}: {
  active: boolean
  label: string
  href?: string
  onClick?: () => void
  children: ReactNode
}) {
  const className = `mobile-bottom-nav-item${active ? " mobile-bottom-nav-item--active" : ""}`

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={className} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)

  const view = searchParams.get("view")
  const searchFlag = searchParams.get("search")
  const onListings = pathname === "/listings" || pathname.startsWith("/listings/")

  const activeId: NavItemId = (() => {
    if (pathname === "/") return "home"
    if (onListings && view === "map") return "map"
    if (onListings && searchFlag === "true") return "search"
    if (pathname.startsWith("/listings")) return "explore"
    return "home"
  })()

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen, closeMenu])

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null

  return (
    <>
      <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
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
            <button
              type="button"
              className={`mobile-bottom-nav-item mobile-bottom-nav-menu${menuOpen ? " mobile-bottom-nav-item--active" : ""}`}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span className="mobile-bottom-nav-logo-wrap">
                <Image src="/one.png" alt="" width={36} height={36} className="mobile-bottom-nav-logo" />
                <span className="mobile-bottom-nav-dot" aria-hidden />
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {menuOpen ? (
        <div className="mobile-bottom-nav-sheet-root md:hidden" role="presentation">
          <button
            type="button"
            className="mobile-bottom-nav-overlay"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="mobile-bottom-nav-sheet" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="mobile-bottom-nav-sheet-header">
              <div className="mobile-bottom-nav-sheet-brand">
                <Image src="/one.png" alt="" width={40} height={40} className="mobile-bottom-nav-sheet-logo" />
                <span className="mobile-bottom-nav-sheet-title">Sauraha Nepal</span>
              </div>
              <button
                type="button"
                className="mobile-bottom-nav-sheet-close"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <IconClose />
              </button>
            </div>
            <ul className="mobile-bottom-nav-sheet-list">
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="mobile-bottom-nav-sheet-row" onClick={closeMenu}>
                    <span className="mobile-bottom-nav-sheet-row-icon">{item.icon}</span>
                    <span className="mobile-bottom-nav-sheet-row-label">{item.label}</span>
                    <IconChevron />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
