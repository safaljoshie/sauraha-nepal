import Image from "next/image"
import Link from "next/link"
import type { ActivityCardItem } from "@/lib/homepage-data"
import { getCategoryDisplay, getListingImage } from "@/lib/listings-catalog"

export default function HomeActivityCard({ item }: { item: ActivityCardItem }) {
  if (item.type === "placeholder") {
    return (
      <Link
        href={item.href}
        className="group relative block h-60 overflow-hidden rounded-2xl transition-transform hover:scale-[1.03]"
      >
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="240px" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(10,35,12,0.85)] to-transparent p-5">
          <p className="font-bold text-white">{item.name}</p>
          <p className="text-sm text-white/75">{item.description}</p>
        </div>
      </Link>
    )
  }

  const { listing } = item
  const image = getListingImage(listing)

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative block h-60 overflow-hidden rounded-2xl transition-transform hover:scale-[1.03]"
    >
      <Image
        src={image}
        alt={listing.business_name}
        fill
        className="object-cover"
        sizes="240px"
        unoptimized={!image.includes("unsplash")}
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(10,35,12,0.85)] to-transparent p-5">
        <p className="text-xs font-semibold text-orange-light">
          {getCategoryDisplay(listing.category)}
        </p>
        <p className="font-bold text-white">{listing.business_name}</p>
        <p className="line-clamp-2 text-sm text-white/75">
          {listing.description ?? listing.category}
        </p>
      </div>
    </Link>
  )
}
