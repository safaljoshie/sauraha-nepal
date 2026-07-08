type GuideStarRatingProps = {
  rating: number
  max?: number
  size?: "sm" | "md"
  showValue?: boolean
  className?: string
}

export default function GuideStarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  className = "",
}: GuideStarRatingProps) {
  const starSize = size === "md" ? "text-lg" : "text-sm"
  const rounded = Math.round(rating * 2) / 2

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`inline-flex text-orange-brand ${starSize}`} aria-hidden>
        {Array.from({ length: max }, (_, index) => {
          const value = index + 1
          const filled = rounded >= value
          const half = !filled && rounded >= value - 0.5
          return (
            <span key={value} className={filled || half ? "opacity-100" : "opacity-25"}>
              {half ? "★" : "★"}
            </span>
          )
        })}
      </span>
      {showValue ? (
        <span className="text-sm font-semibold text-text-brand">
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      ) : null}
    </span>
  )
}
