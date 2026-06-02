"use client"

import { useEffect, useRef, useState } from "react"

type StatConfig =
  | { label: string; type: "static"; display: string }
  | { label: string; type: "animated"; value: number; suffix?: string }

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function AnimatedValue({
  value,
  suffix = "",
  active,
}: {
  value: number
  suffix?: string
  active: boolean
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return

    const duration = 1500
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(easeOutCubic(progress) * value))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [active, value])

  return (
    <>
      {display}
      {suffix}
    </>
  )
}

export default function HeroStats({ stats }: { stats: StatConfig[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const checkInView = () => {
      const rect = node.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

    if (checkInView()) setInView(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-10">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center text-white">
          <strong className="block text-2xl font-bold text-orange-light">
            {stat.type === "static" ? (
              stat.display
            ) : (
              <AnimatedValue
                value={stat.value}
                suffix={stat.suffix}
                active={inView}
              />
            )}
          </strong>
          <span className="text-sm opacity-80">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
