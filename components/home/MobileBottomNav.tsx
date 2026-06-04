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
  const onHome = pathname === "/"

  if (!onHome) return null

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-[95] border-t border-border-brand bg-white/96 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex justify-around">
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
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold transition-colors ${
                  active ? "text-green-brand" : "text-text-light"
                }`}
              >
                <span className="text-lg" aria-hidden>
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
