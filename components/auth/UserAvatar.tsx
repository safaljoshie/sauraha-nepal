"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"

function initials(user: Pick<User, "email" | "user_metadata">): string {
  const meta = user.user_metadata ?? {}
  const name = (meta.full_name as string) || (meta.name as string) || user.email || "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/**
 * Renders the user's Google avatar, falling back to their initials. Uses a
 * plain <img> deliberately: Google avatar hosts are external and don't warrant
 * next/image remotePatterns config, and this keeps the bundle small.
 */
export function UserAvatar({
  user,
  size = 40,
}: {
  user: Pick<User, "email" | "user_metadata">
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  const avatarUrl = (user.user_metadata?.avatar_url as string) || null

  if (avatarUrl && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className="rounded-full object-cover ring-2 ring-white/40"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-full bg-green-brand font-bold text-white ring-2 ring-white/40"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(user)}
    </span>
  )
}
