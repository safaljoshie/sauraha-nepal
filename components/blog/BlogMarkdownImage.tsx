"use client"

import Image from "next/image"
import { DEFAULT_IMAGE_QUALITY, isNextOptimizedImageSrc } from "@/lib/image"

type BlogMarkdownImageProps = {
  src?: string | Blob
  alt?: string
}

export default function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  const url = typeof src === "string" ? src : ""
  if (!url) return null

  return (
    <span className="relative my-6 block h-[3in] w-full overflow-hidden rounded-xl">
      <Image
        src={url}
        alt={alt ?? ""}
        fill
        className="blog-image object-cover"
        sizes="(max-width: 896px) 100vw, 896px"
        quality={DEFAULT_IMAGE_QUALITY}
        loading="lazy"
        unoptimized={!isNextOptimizedImageSrc(url)}
      />
    </span>
  )
}
