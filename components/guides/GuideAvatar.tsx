"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { getGuideInitials } from "@/lib/tour-guides"
import { isNextOptimizedImageSrc } from "@/lib/image"

type GuideAvatarProps = {
  name: string
  photoUrl: string | null
  size?: "card" | "profile"
  className?: string
  alt?: string
}

const sizeMap = {
  card: { px: 80, className: "h-20 w-20 text-xl" },
  profile: { px: 96, className: "h-24 w-24 text-2xl" },
} as const

export default function GuideAvatar({
  name,
  photoUrl,
  size = "card",
  className = "",
  alt,
}: GuideAvatarProps) {
  const { px, className: sizeClass } = sizeMap[size]
  const src = photoUrl?.trim() ?? ""
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed || !isNextOptimizedImageSrc(src)) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-green-brand font-bold text-white ring-2 ring-white shadow-md ${sizeClass} ${className}`}
        aria-hidden
      >
        {getGuideInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md ${sizeClass} ${className}`}
    >
      {/* Explicit width/height (not `fill` + `sizes`) so Next emits a 1x/2x
          pair instead of a srcset spanning every configured width. */}
      <Image
        src={src}
        alt={alt ?? ""}
        width={px}
        height={px}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
