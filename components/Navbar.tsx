"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/#activities", label: "Activities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

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

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-[100] flex items-center justify-between border-b border-border-brand bg-white/96 px-5 py-3 backdrop-blur-sm md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/one.png"
            alt="Sauraha Nepal Logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            priority
          />
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-green-brand">
            Sauraha Nepal
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                  ? false
                  : pathname === link.href

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-[0.95rem] font-medium transition-colors ${
                    isActive ? "text-green-mid" : "text-text-mid hover:text-green-mid"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/list-your-business"
            className="hidden rounded-full bg-orange-brand px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-green-brand md:inline-block"
          >
            List Your Business
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-green-brand md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[110] md:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-label="Close menu"
        />
        <div
          className={`absolute top-0 right-0 flex h-full w-[min(320px,85vw)] flex-col bg-green-brand px-6 py-8 text-white shadow-xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold">
              Menu
            </span>
            <button
              type="button"
              onClick={closeMenu}
              className="text-2xl leading-none"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <ul className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="text-lg font-medium text-white/90 hover:text-orange-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/list-your-business"
            onClick={closeMenu}
            className="btn-orange mt-8 block py-3 text-center text-base font-bold"
          >
            List Your Business
          </Link>
        </div>
      </div>
    </>
  )
}
