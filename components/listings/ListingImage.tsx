"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { LISTING_IMAGE_FALLBACK } from "@/lib/listings-catalog"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"

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

function shouldUseUnoptimized(src: string) {
  const trimmed = src.trim()
  if (!trimmed) return false
  if (trimmed.includes(".supabase.co")) return true
  return !isNextOptimizedImageSrc(trimmed)
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
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const trimmedSrc = src.trim()
  const displaySrc =
    failed || !trimmedSrc ? LISTING_IMAGE_FALLBACK : trimmedSrc

  return (
    <Image
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : loading}
      unoptimized={shouldUseUnoptimized(displaySrc)}
      onError={() => {
        if (!failed && displaySrc !== LISTING_IMAGE_FALLBACK) {
          setFailed(true)
        }
      }}
    />
  )
}
