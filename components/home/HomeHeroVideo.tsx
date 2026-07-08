"use client"

import Image from "next/image"
import { DEFAULT_IMAGE_QUALITY } from "@/lib/image"
import { useEffect, useRef, useState } from "react"

const HERO_POSTER = "/images/hero_start.jpeg"

const USER_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const

type HomeHeroVideoProps = {
  url: string
  posterUrl: string | null
}

export default function HomeHeroVideo({ url }: HomeHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

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
        src={HERO_POSTER}
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
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${HERO_POSTER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_POSTER}
        >
          <source src={url} type="video/mp4" />
        </video>
      </div>
    </>
  )
}
