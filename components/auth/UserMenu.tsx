"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { UserAvatar } from "@/components/auth/UserAvatar"

export default function UserMenu({ transparent = false }: { transparent?: boolean }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [open])

  async function signOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/")
    router.refresh()
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className={`hidden rounded-xl px-4 py-2 text-xs font-bold tracking-wide uppercase transition-colors md:inline-block ${
          transparent
            ? "border border-white/60 text-white hover:bg-white/10"
            : "border border-green-brand/30 text-green-brand hover:bg-green-brand/5"
        }`}
      >
        Sign in
      </Link>
    )
  }

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-mid"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserAvatar user={user} size={40} />
      </button>
      {open && (
        <div
          role="menu"
          className="animate-fade-up absolute right-0 z-[120] mt-2 w-56 overflow-hidden rounded-xl border border-border-brand bg-white py-1 text-ink shadow-lg"
        >
          <div className="border-b border-border-brand px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {displayName(user)}
            </p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-cream hover:text-green-brand"
          >
            Profile
          </Link>
          <Link
            href="/account/reviews"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-cream hover:text-green-brand"
          >
            My reviews
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-orange-brand hover:bg-orange-brand/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function displayName(user: User): string {
  const meta = user.user_metadata ?? {}
  return (meta.full_name as string) || (meta.name as string) || user.email || "Traveller"
}
