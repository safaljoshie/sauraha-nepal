"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import SiteIcon from "@/components/icons/SiteIcon"
import type { FavouriteTargetType } from "@/lib/favourites"

type FavouriteButtonProps = {
  targetType: FavouriteTargetType
  targetId: string
  initialFavourited?: boolean
  signedIn: boolean
  /** card = absolute overlay chip; detail = inline control */
  variant?: "card" | "detail"
  className?: string
}

export default function FavouriteButton({
  targetType,
  targetId,
  initialFavourited = false,
  signedIn,
  variant = "card",
  className = "",
}: FavouriteButtonProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [favourited, setFavourited] = useState(initialFavourited)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const signInHref = `/signin?next=${encodeURIComponent(pathname || "/")}`

  const baseClass =
    variant === "card"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-green-brand shadow-sm ring-1 ring-black/5 transition hover:bg-white"
      : "inline-flex items-center gap-2 rounded-xl border border-green-brand/30 bg-white px-3 py-2 text-sm font-semibold text-green-brand transition hover:bg-green-brand/5"

  const iconClass = favourited ? "fill-current text-green-brand" : "text-green-brand"

  if (!signedIn) {
    return (
      <Link
        href={signInHref}
        onClick={(e) => e.stopPropagation()}
        className={`pointer-events-auto ${baseClass} ${className}`}
        aria-label="Sign in to save favourite"
        title="Sign in to save"
      >
        <SiteIcon name="heart" size={variant === "card" ? 18 : 16} className={iconClass} />
        {variant === "detail" ? <span>Save</span> : null}
      </Link>
    )
  }

  async function toggle() {
    setError(null)
    const previous = favourited
    setFavourited(!previous)

    try {
      const res = await fetch("/api/favourites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      })
      const data = (await res.json()) as { favourited?: boolean; error?: string }
      if (!res.ok) {
        setFavourited(previous)
        if (res.status === 401) {
          router.push(signInHref)
          return
        }
        setError(data.error ?? "Could not update favourite.")
        return
      }
      setFavourited(Boolean(data.favourited))
      startTransition(() => router.refresh())
    } catch {
      setFavourited(previous)
      setError("Could not update favourite.")
    }
  }

  return (
    <span className={`pointer-events-auto inline-flex flex-col items-end ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!pending) void toggle()
        }}
        disabled={pending}
        className={`${baseClass} disabled:opacity-60`}
        aria-pressed={favourited}
        aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
        title={favourited ? "Saved" : "Save to favourites"}
      >
        <SiteIcon
          name="heart"
          size={variant === "card" ? 18 : 16}
          className={iconClass}
        />
        {variant === "detail" ? <span>{favourited ? "Saved" : "Save"}</span> : null}
      </button>
      {error ? (
        <span className="mt-1 max-w-[10rem] text-right text-[11px] font-semibold text-orange-brand">
          {error}
        </span>
      ) : null}
    </span>
  )
}
