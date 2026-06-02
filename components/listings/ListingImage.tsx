"use client"

import Image from "next/image"
import { useState } from "react"

const PLACEHOLDER = "/images/placeholder-listing.jpg"

type ListingImageProps = {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  loading?: "lazy" | "eager"
}

export default function ListingImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  sizes,
  priority,
  loading = "lazy",
}: ListingImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const unoptimized = !imgSrc.includes("unsplash") && !imgSrc.startsWith("/")

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading}
      unoptimized={unoptimized}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  )
}
