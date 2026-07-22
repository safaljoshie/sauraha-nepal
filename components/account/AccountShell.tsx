"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { UserAvatar } from "@/components/auth/UserAvatar"

const NAV = [
  { href: "/account", label: "Profile", icon: "👤" },
  { href: "/account/reviews", label: "My reviews", icon: "⭐" },
]

export default function AccountShell({
  name,
  email,
  avatarUrl,
  children,
}: {
  name: string
  email: string
  avatarUrl: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const avatarUser = {
    email,
    user_metadata: { avatar_url: avatarUrl ?? undefined, full_name: name },
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      {/* Sidebar */}
      <aside className="flex flex-col bg-ink text-white md:min-h-screen md:w-72">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <UserAvatar user={avatarUser} size={44} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{name || "Traveller"}</p>
            <p className="truncate text-xs text-white/60">Member</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible md:py-4">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-green-brand text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 px-3 py-4 md:block">
          <Link
            href="/"
            className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
          >
            ← Back to site
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-orange-brand hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
        <div className="mx-auto mt-8 flex w-full max-w-3xl gap-4 md:hidden">
          <Link href="/" className="text-sm font-semibold text-text-mid">
            ← Back to site
          </Link>
          <button type="button" onClick={signOut} className="text-sm font-semibold text-orange-brand">
            Sign out
          </button>
        </div>
      </main>
    </div>
  )
}
