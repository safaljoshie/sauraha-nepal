"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

// Auth entries for the mobile navigation drawer. Mirrors UserMenu but styled
// for the full-width drawer list.
export default function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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

  async function signOut() {
    await supabase.auth.signOut()
    onNavigate()
    router.push("/")
    router.refresh()
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        onClick={onNavigate}
        className="block py-3 font-semibold text-ink-muted hover:text-green-brand"
      >
        Sign in
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/account"
        onClick={onNavigate}
        className="block py-3 font-semibold text-ink-muted hover:text-green-brand"
      >
        Profile
      </Link>
      <Link
        href="/account/reviews"
        onClick={onNavigate}
        className="block py-3 font-semibold text-ink-muted hover:text-green-brand"
      >
        My reviews
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="block w-full py-3 text-left font-semibold text-orange-brand"
      >
        Sign out
      </button>
    </>
  )
}
