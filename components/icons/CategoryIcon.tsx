import { resolveCategoryIcon } from "@/lib/category-icon-map"

type CategoryIconProps = {
  slug: string
  storedIcon?: string | null
  size?: number
  className?: string
  strokeWidth?: number
}

export default function CategoryIcon({
  slug,
  storedIcon,
  size = 18,
  className = "",
  strokeWidth = 2.25,
}: CategoryIconProps) {
  const Icon = resolveCategoryIcon(slug, storedIcon)

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
    />
  )
}
