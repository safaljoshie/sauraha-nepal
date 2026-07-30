"use client"

import Image from "next/image"
import { DEFAULT_IMAGE_QUALITY } from "@/lib/image"
import { useEffect, useRef, useState, type CSSProperties } from "react"

const HERO_POSTER = "/images/hero_start.jpeg"
const YOUTUBE_VIDEO_ID = "YPXwRXfC3t4"
const YOUTUBE_API_SRC = "https://www.youtube.com/iframe_api"
const USER_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const

const FRAME_STYLE: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "100vw",
  height: "56.25vw",
  minHeight: "100%",
  minWidth: "177.77vh",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
}

type YtPlayer = {
  playVideo: () => void
  mute: () => void
  destroy: () => void
  getIframe?: () => HTMLIFrameElement
}

type YtNamespace = {
  Player: new (
    element: HTMLElement | string,
    config: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YtPlayer }) => void
        onStateChange?: (event: { data: number; target: YtPlayer }) => void
      }
    },
  ) => YtPlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeApi(): Promise<YtNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }

    if (!document.querySelector(`script[src="${YOUTUBE_API_SRC}"]`)) {
      const script = document.createElement("script")
      script.src = YOUTUBE_API_SRC
      script.async = true
      document.head.appendChild(script)
    }
  })
}

function sizeIframeToCover(player: YtPlayer) {
  const iframe = player.getIframe?.()
  if (!iframe) return
  iframe.removeAttribute("width")
  iframe.removeAttribute("height")
  Object.assign(iframe.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    border: "0",
    pointerEvents: "none",
  })
}

export default function HomeHeroVideo() {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    let interactionAttached = false

    const tryPlay = () => {
      const player = playerRef.current
      if (!player) return
      player.mute()
      player.playVideo()
    }

    const detachInteraction = () => {
      if (!interactionAttached) return
      interactionAttached = false
      for (const eventName of USER_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, onInteraction)
      }
    }

    const onInteraction = () => {
      detachInteraction()
      tryPlay()
    }

    const attachInteractionFallback = () => {
      if (interactionAttached) return
      interactionAttached = true
      for (const eventName of USER_INTERACTION_EVENTS) {
        window.addEventListener(eventName, onInteraction, { once: true, passive: true })
      }
    }

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return

      playerRef.current = new YT.Player(hostRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          playlist: YOUTUBE_VIDEO_ID,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return
            sizeIframeToCover(event.target)
            event.target.mute()
            event.target.playVideo()
            // If the browser still blocks autoplay, keep the poster and retry on first gesture.
            attachInteractionFallback()
          },
          onStateChange: (event) => {
            if (cancelled) return
            if (event.data === YT.PlayerState.PLAYING) {
              sizeIframeToCover(event.target)
              setIsPlaying(true)
              detachInteraction()
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      detachInteraction()
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  return (
    <>
      {/* Poster stays on top until playback actually starts — hides the YouTube play button. */}
      <Image
        src={HERO_POSTER}
        alt=""
        aria-hidden
        fill
        priority
        quality={DEFAULT_IMAGE_QUALITY}
        sizes="100vw"
        className={`pointer-events-none absolute inset-0 z-[1] object-cover transition-opacity duration-700 ${
          isPlaying ? "opacity-0" : "opacity-100"
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
        <div className="absolute inset-0 overflow-hidden">
          <div style={FRAME_STYLE}>
            <div ref={hostRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>
    </>
  )
}
