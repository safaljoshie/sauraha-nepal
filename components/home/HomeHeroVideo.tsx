"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

/** Shown only while the video buffers when no CMS poster is set. */
const LOADING_POSTER = "/images/sauraha-hero.jpg"

type HomeHeroVideoProps = {
  url: string
  posterUrl: string | null
}

export default function HomeHeroVideo({ url, posterUrl }: HomeHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const cmsPoster = posterUrl?.trim() || null
  const displayPoster = cmsPoster ?? LOADING_POSTER

  useEffect(() => {
    setVideoReady(false)
    const video = videoRef.current
    if (!video) return

    const markReady = () => setVideoReady(true)

    video.addEventListener("loadeddata", markReady)
    video.addEventListener("canplay", markReady)

    video.load()
    void video.play().catch(() => {
      // Muted autoplay is usually allowed; ignore rare policy blocks.
    })

    return () => {
      video.removeEventListener("loadeddata", markReady)
      video.removeEventListener("canplay", markReady)
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
        preload="metadata"
        poster={displayPoster}
      >
        <source src={url} type="video/mp4" />
      </video>
    </>
  )
}
