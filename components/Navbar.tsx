"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import { getStayListingsHref, type CategoryCatalog } from "@/lib/category-catalog"

const baseNavLinks = [
  { href: "/#places", label: "Places" },
  { href: "/#experiences", label: "Things to do" },
  { href: "/blog", label: "Articles" },
  { href: "/#map", label: "Map" },
]

function getSiteRoot() {
  return document.getElementById("site-root")
}

function hasHomeMarker() {
  if (typeof document === "undefined") return false
  return Boolean(getSiteRoot()?.querySelector("#home-page-marker"))
}

export default function Navbar({ catalog }: { catalog: CategoryCatalog }) {
  const navLinks = useMemo(
    () => [
      baseNavLinks[0],
      { href: getStayListingsHref(catalog), label: "Stay" },
      ...baseNavLinks.slice(1),
    ],
    [catalog],
  )
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useLayoutEffect(() => {
    const root = getSiteRoot()
    const onHome = hasHomeMarker()

    if (!onHome) {
      root?.classList.remove("nav-scrolled")
      setScrolled(true)
      return
    }

    function onScroll() {
      const next = window.scrollY > 48
      setScrolled(next)
      root?.classList.toggle("nav-scrolled", next)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      root?.classList.remove("nav-scrolled")
    }
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen, closeMenu])

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  const transparent = isHome && !scrolled && !menuOpen

  return (
    <>
      <nav
        className={`site-navbar fixed top-0 right-0 left-0 z-[100] transition-colors duration-300 ${
          transparent
            ? "border-transparent bg-transparent text-white"
            : "border-b border-black/8 bg-white text-ink shadow-sm"
        }`}
      >
        <div className="site-container flex items-center justify-between py-3">
        <Link href="/" className="nav-brand flex items-center gap-3">
          <Image
            src="/one.png"
            alt="Sauraha Nepal"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/30"
            priority
          />
          <span
            className={`font-heading text-lg font-bold tracking-tight ${
              transparent ? "text-white" : "text-green-brand"
            }`}
          >
            Sauraha Nepal
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link text-[0.9rem] font-semibold tracking-wide uppercase transition-colors ${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-ink-muted hover:text-green-brand"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#hero-search"
            className={`nav-icon hidden h-10 w-10 items-center justify-center md:flex ${
              transparent ? "text-white" : "text-ink"
            }`}
            aria-label="Search"
          >
            <SiteIcon name="search" size={22} strokeWidth={2.25} />
          </Link>
          <Link
            href="/list-your-business"
            className={`nav-cta hidden rounded-xl px-5 py-2 text-xs font-bold tracking-wide uppercase transition-colors md:inline-block ${
              transparent
                ? "border border-white/60 text-white hover:bg-white/10"
                : "bg-green-brand text-white hover:bg-green-mid"
            }`}
          >
            List business
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`nav-icon flex h-10 w-10 items-center justify-center text-2xl lg:hidden ${
              transparent ? "text-white" : "text-ink"
            }`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <SiteIcon name="close" size={24} strokeWidth={2.5} />
            ) : (
              <SiteIcon name="menu" size={24} strokeWidth={2.5} />
            )}
          </button>
        </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[110] lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-label="Close menu"
        />
        <div
          className={`absolute top-0 right-0 flex h-full w-[min(320px,88vw)] flex-col bg-white px-6 py-8 shadow-xl transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-heading text-lg font-bold text-ink">Menu</span>
            <button type="button" onClick={closeMenu} className="text-ink" aria-label="Close">
              <SiteIcon name="close" size={24} strokeWidth={2.5} />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/" onClick={closeMenu} className="block py-3 font-semibold text-ink">
                Home
              </Link>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block py-3 font-semibold text-ink-muted hover:text-green-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/list-your-business"
            onClick={closeMenu}
            className="mt-8 rounded-xl bg-green-brand py-3 text-center text-sm font-bold tracking-wide text-white uppercase"
          >
            List your business
          </Link>
        </div>
      </div>
    </>
  )
}
