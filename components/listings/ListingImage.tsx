"use client"

import Image from "next/image"
import { useState } from "react"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"

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
  quality?: number
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
  quality = DEFAULT_IMAGE_QUALITY,
}: ListingImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : loading}
      unoptimized={!isNextOptimizedImageSrc(imgSrc)}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  )
}
