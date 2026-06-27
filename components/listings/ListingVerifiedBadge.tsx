import Image from "next/image"

type ListingVerifiedBadgeProps = {
  size?: "card" | "detail"
  className?: string
}

const sizeClasses = {
  card: "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20",
  detail: "h-24 w-24 sm:h-28 sm:w-28",
} as const

export default function ListingVerifiedBadge({
  size = "card",
  className = "",
}: ListingVerifiedBadgeProps) {
  return (
    <span
      className={`pointer-events-none inline-flex shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      <Image
        src="/verified-badge.png"
        alt=""
        width={112}
        height={112}
        className="h-full w-full object-contain"
        sizes={size === "detail" ? "112px" : "80px"}
      />
    </span>
  )
}
