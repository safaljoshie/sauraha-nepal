import Image from "next/image"
import Link from "next/link"
import type { Listing } from "@/lib/data"

export interface ListingCardProps extends Listing {
  variant?: "featured" | "full"
}

export default function ListingCard({
  image,
  badge,
  category,
  name,
  description,
  location,
  price,
  rating,
  reviews,
  variant = "featured",
}: ListingCardProps) {
  const imageHeight = variant === "full" ? "h-[210px]" : "h-[200px]"

  return (
    <article className="card-hover overflow-hidden rounded-[18px] border border-border-brand bg-white">
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-400 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-orange-brand px-2.5 py-1 text-[0.72rem] font-bold tracking-wider text-white uppercase">
            {badge}
          </span>
        )}
        <button
          type="button"
          aria-label="Save to favourites"
          className="absolute top-3 right-3 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-base shadow-md transition-transform hover:scale-110"
        >
          ♡
        </button>
      </div>

      <div className="p-5">
        <p className="mb-1 text-[0.78rem] font-bold tracking-widest text-green-mid uppercase">
          {category}
        </p>
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-text-brand">
          {name}
        </h3>

        {variant === "featured" ? (
          <p className="mt-2 mb-3 text-sm text-text-light">📍 {location}</p>
        ) : (
          <p className="mt-2 mb-3 line-clamp-2 text-sm leading-relaxed text-text-light">
            {description}
          </p>
        )}

        <div
          className={`flex items-center justify-between ${
            variant === "full" ? "border-t border-border-brand pt-3" : ""
          }`}
        >
          <span className="font-bold text-green-brand">{price}</span>
          <span className="text-sm font-semibold text-brown-brand">
            ⭐ {rating} · {reviews} reviews
          </span>
        </div>

        {variant === "full" && (
          <div className="mt-3 flex gap-2">
            <Link href="#" className="rounded-full bg-green-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-mid">
              View Details
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-[1.5px] border-green-brand px-4 py-1.5 text-sm font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white"
            >
              WhatsApp
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
