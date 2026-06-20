import SiteIcon from "@/components/icons/SiteIcon"

export function ListingAddress({
  address,
  className = "",
}: {
  address?: string | null
  className?: string
}) {
  return (
    <p className={`mt-2 flex items-start gap-1.5 text-sm text-text-mid ${className}`}>
      <SiteIcon name="map-pin" size={16} className="mt-0.5 shrink-0 text-green-mid" strokeWidth={2.25} />
      <span>{address ?? "Sauraha, Nepal"}</span>
    </p>
  )
}

export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-orange-brand px-2.5 py-1 text-[0.72rem] font-bold text-white ${className}`}
    >
      <SiteIcon name="star" size={12} className="fill-white text-white" strokeWidth={2} />
      Premium
    </span>
  )
}
