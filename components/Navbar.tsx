"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/#activities", label: "Activities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between border-b border-border-brand bg-white/96 px-5 py-3 backdrop-blur-sm md:px-10">
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

      <Link
        href="/list-your-business"
        className="rounded-full bg-orange-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-brand"
      >
        List Your Business
      </Link>
    </nav>
  )
}
