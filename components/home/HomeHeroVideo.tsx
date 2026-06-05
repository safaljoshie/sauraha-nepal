"use client"

import Image from "next/image"
import { useState } from "react"

const FALLBACK_POSTER = "/images/home-hero.png"

type HomeHeroVideoProps = {
  url: string
  posterUrl: string | null
}

export default function HomeHeroVideo({ url, posterUrl }: HomeHeroVideoProps) {
  const [videoReady, setVideoReady] = useState(false)
  const poster = posterUrl ?? FALLBACK_POSTER

  return (
    <>
      <Image
        src={poster}
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
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        onCanPlay={() => setVideoReady(true)}
      >
        <source src={url} type="video/mp4" />
      </video>
    </>
  )
}
