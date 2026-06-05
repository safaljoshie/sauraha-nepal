"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type DeferredMountProps = {
  children: ReactNode
  fallback: ReactNode
  rootMargin?: string
}

/** Mount children only when the placeholder enters (or nears) the viewport. */
export default function DeferredMount({
  children,
  fallback,
  rootMargin = "200px",
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return <div ref={ref}>{visible ? children : fallback}</div>
}
