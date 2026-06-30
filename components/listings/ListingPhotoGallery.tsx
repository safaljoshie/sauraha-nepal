"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import ListingImage from "@/components/listings/ListingImage"
import ListingVerifiedBadge from "@/components/listings/ListingVerifiedBadge"
import { LISTING_IMAGE_FALLBACK } from "@/lib/listings-catalog"

type ListingPhotoGalleryProps = {
  photos: string[]
  alt: string
  verified?: boolean
  priority?: boolean
}

function SinglePhotoHero({
  src,
  alt,
  verified,
  priority,
}: {
  src: string
  alt: string
  verified?: boolean
  priority?: boolean
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
      <ListingImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 800px"
        priority={priority}
      />
      {verified && (
        <span className="absolute bottom-3 left-3 z-[2] sm:bottom-4 sm:left-4">
          <ListingVerifiedBadge size="detail" />
        </span>
      )}
    </div>
  )
}

export default function ListingPhotoGallery({
  photos,
  alt,
  verified,
  priority,
}: ListingPhotoGalleryProps) {
  const slides = photos.filter(Boolean)
  const displaySrc = slides[0]?.trim() || LISTING_IMAGE_FALLBACK

  if (slides.length <= 1) {
    return (
      <SinglePhotoHero
        src={displaySrc}
        alt={alt}
        verified={verified}
        priority={priority}
      />
    )
  }

  return (
    <MultiPhotoGallery
      photos={slides}
      alt={alt}
      verified={verified}
      priority={priority}
    />
  )
}

function MultiPhotoGallery({
  photos,
  alt,
  verified,
  priority,
}: Required<Pick<ListingPhotoGalleryProps, "photos" | "alt">> &
  Pick<ListingPhotoGalleryProps, "verified" | "priority">) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const thumbScrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(Math.min(Math.max(index, 0), photos.length - 1))
  }, [photos.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", syncIndexFromScroll, { passive: true })
    return () => el.removeEventListener("scroll", syncIndexFromScroll)
  }, [syncIndexFromScroll])

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const clamped = Math.min(Math.max(index, 0), photos.length - 1)
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" })
      setActiveIndex(clamped)
    },
    [photos.length],
  )

  useEffect(() => {
    const thumbEl = thumbScrollRef.current
    if (!thumbEl) return
    const activeThumb = thumbEl.children[activeIndex] as HTMLElement | undefined
    activeThumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [activeIndex])

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollToIndex(activeIndex - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollToIndex(activeIndex + 1)
    }
  }

  const atStart = activeIndex === 0
  const atEnd = activeIndex === photos.length - 1

  return (
    <div
      className="space-y-3"
      role="region"
      aria-roledescription="carousel"
      aria-label="Business photos"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square w-full shrink-0 snap-center snap-always"
              aria-hidden={index !== activeIndex}
            >
              <ListingImage
                src={url}
                alt={index === 0 ? alt : `${alt} (${index + 1} of ${photos.length})`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
                priority={priority && index === 0}
                loading={index === 0 && priority ? undefined : "lazy"}
              />
            </div>
          ))}
        </div>

        <span
          className="pointer-events-none absolute top-3 right-3 z-[2] rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white"
          aria-live="polite"
        >
          {activeIndex + 1} / {photos.length}
        </span>

        {verified && (
          <span className="absolute bottom-3 left-3 z-[2] sm:bottom-4 sm:left-4">
            <ListingVerifiedBadge size="detail" />
          </span>
        )}

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={atStart}
          aria-label="Previous photo"
          className="absolute top-1/2 left-2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-opacity hover:bg-black/60 disabled:pointer-events-none disabled:opacity-0 sm:left-3 sm:h-11 sm:w-11"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={atEnd}
          aria-label="Next photo"
          className="absolute top-1/2 right-2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-opacity hover:bg-black/60 disabled:pointer-events-none disabled:opacity-0 sm:right-3 sm:h-11 sm:w-11"
        >
          <ChevronRight className="h-6 w-6" aria-hidden />
        </button>
      </div>

      <div
        ref={thumbScrollRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Photo thumbnails"
      >
        {photos.map((url, index) => (
          <button
            key={`thumb-${url}-${index}`}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Show photo ${index + 1} of ${photos.length}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-lg transition-shadow ${
              index === activeIndex
                ? "ring-2 ring-green-brand ring-offset-2"
                : "opacity-75 hover:opacity-100"
            }`}
          >
            <ListingImage
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
