"use client"

import Image from "next/image"
import { DEFAULT_IMAGE_QUALITY } from "@/lib/image"
import { getStoragePublicUrl } from "@/lib/list-business-photos"
import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react"

/** hero_start.jpeg — shown immediately; video loads only after user interaction. */
const DEFAULT_HERO_POSTER = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const bucket = "Sauraha Nepal Listing uploads"
  if (!supabaseUrl) return "/images/sauraha-hero.jpg"
  return getStoragePublicUrl(
    bucket,
    "admin/site/hero/image/78533902-aa3d-4a2e-86b4-94568c477a31/hero_start.jpeg",
    supabaseUrl,
  )
})()

const USER_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const

type HomeHeroVideoProps = {
  url: string
  posterUrl: string | null
}

export default function HomeHeroVideo({ url, posterUrl }: HomeHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const cmsPoster = posterUrl?.trim() || null
  const displayPoster = cmsPoster ?? DEFAULT_HERO_POSTER

  useEffect(() => {
    setVideoReady(false)
    const video = videoRef.current
    if (!video) return

    let started = false

    const markReady = () => setVideoReady(true)

    const detachReadyListeners = () => {
      video.removeEventListener("loadeddata", markReady)
      video.removeEventListener("canplay", markReady)
    }

    const detachInteractionListeners = () => {
      for (const eventName of USER_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, startVideo)
      }
    }

    const startVideo = () => {
      if (started) return
      started = true
      detachInteractionListeners()

      video.addEventListener("loadeddata", markReady)
      video.addEventListener("canplay", markReady)
      video.load()
      void video.play().catch(() => {
        // Muted autoplay is usually allowed; ignore rare policy blocks.
      })
    }

    for (const eventName of USER_INTERACTION_EVENTS) {
      window.addEventListener(eventName, startVideo, { once: true, passive: true })
    }

    return () => {
      detachInteractionListeners()
      detachReadyListeners()
    }
  }, [url])

  return (
    <>
      <Image
        src={displayPoster}
        alt=""
        aria-hidden
        fill
        priority
        quality={DEFAULT_IMAGE_QUALITY}
        sizes="100vw"
        className={`pointer-events-none absolute inset-0 z-0 object-cover transition-opacity duration-700 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={displayPoster}
        {...({ loading: "lazy" } as VideoHTMLAttributes<HTMLVideoElement>)}
      >
        <source src={url} type="video/mp4" />
      </video>
    </>
  )
}
