import Image from "next/image"
import { getGuideInitials } from "@/lib/tour-guides"
import { isNextOptimizedImageSrc } from "@/lib/image"

type GuideAvatarProps = {
  name: string
  photoUrl: string | null
  size?: "card" | "profile"
  className?: string
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
}: GuideAvatarProps) {
  const { px, className: sizeClass } = sizeMap[size]
  const src = photoUrl?.trim()

  if (src && isNextOptimizedImageSrc(src)) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md ${sizeClass} ${className}`}
      >
        <Image src={src} alt="" fill className="object-cover" sizes={`${px}px`} />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-green-brand font-bold text-white ring-2 ring-white shadow-md ${sizeClass} ${className}`}
      aria-hidden
    >
      {getGuideInitials(name)}
    </div>
  )
}
