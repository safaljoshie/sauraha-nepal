"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/#places", label: "Places", icon: "📍" },
  { href: "/#experiences", label: "Do", icon: "🐘" },
  { href: "/listings?category=stay", label: "Stay", icon: "🏨" },
  { href: "/blog", label: "Articles", icon: "📖" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-[95] border-t border-border-brand bg-white/96 px-1 pb-[max(0.3rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-12 items-center justify-around">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.href.startsWith("/#")
                ? false
                : pathname.startsWith(item.href.split("?")[0])
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0 rounded-lg px-2 py-0 text-[0.55rem] font-semibold transition-colors ${
                  active ? "text-green-brand" : "text-text-light"
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
