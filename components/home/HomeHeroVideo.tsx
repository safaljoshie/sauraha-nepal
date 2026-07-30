"use client"

import Image from "next/image"
import { DEFAULT_IMAGE_QUALITY } from "@/lib/image"
import { useState } from "react"

const HERO_POSTER = "/images/hero_start.jpeg"
const YOUTUBE_VIDEO_ID = "YPXwRXfC3t4"
const YOUTUBE_EMBED_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`

export default function HomeHeroVideo() {
  const [iframeReady, setIframeReady] = useState(false)

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
          iframeReady ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_POSTER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          <iframe
            src={YOUTUBE_EMBED_SRC}
            title="Sauraha homepage background"
            allow="autoplay; encrypted-media"
            onLoad={() => setIframeReady(true)}
            className={`transition-opacity duration-700 ${
              iframeReady ? "opacity-100" : "opacity-0"
            }`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100vw",
              height: "56.25vw",
              minHeight: "100%",
              minWidth: "177.77vh",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              border: "none",
            }}
          />
        </div>
      </div>
    </>
  )
}
