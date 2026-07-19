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

/**
 * optimized → serve through the Next image optimizer (resized, WebP, cached 31
 *             days, so Supabase Storage is read once rather than per pageview)
 * raw       → same URL, optimizer bypassed; the escape hatch for a source the
 *             optimizer can't decode
 * fallback  → stock placeholder, only once the real photo is truly unreachable
 */
type LoadMode = "optimized" | "raw" | "fallback"

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
  const [mode, setMode] = useState<LoadMode>("optimized")

  useEffect(() => {
    setMode("optimized")
  }, [src])

  const trimmedSrc = src.trim()
  const isFallback = mode === "fallback" || !trimmedSrc
  const displaySrc = isFallback ? LISTING_IMAGE_FALLBACK : trimmedSrc

  const canOptimize = isNextOptimizedImageSrc(displaySrc)
  const unoptimized = !canOptimize || (!isFallback && mode === "raw")

  return (
    <Image
      key={`${displaySrc}:${mode}`}
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
      unoptimized={unoptimized}
      onError={() => {
        // Step down one rung rather than jumping straight to the placeholder:
        // a source the optimizer rejects usually still loads directly.
        setMode((current) => {
          if (isFallback) return current
          return current === "optimized" && canOptimize ? "raw" : "fallback"
        })
      }}
    />
  )
}
