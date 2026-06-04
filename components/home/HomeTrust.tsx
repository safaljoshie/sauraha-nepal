"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { TESTIMONIALS, TRAVELLER_PHOTOS } from "@/lib/homepage-constants"

type HomeTrustProps = {
  businessCount: number
  guidesCount: number
}

export default function HomeTrust({ businessCount, guidesCount }: HomeTrustProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  const testimonial = TESTIMONIALS[active]

  return (
    <section className="home-section">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-px bg-black/10 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-muted px-6 py-10 text-center">
            <p className="font-heading text-4xl font-bold text-ink">{businessCount}+</p>
            <p className="mt-2 text-sm text-ink-muted">Businesses listed</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-6 py-10 text-center">
            <p className="font-heading text-4xl font-bold text-ink">{guidesCount}+</p>
            <p className="mt-2 text-sm text-ink-muted">Guides published</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-6 py-10 text-center">
            <p className="font-heading text-4xl font-bold text-ink">10k+</p>
            <p className="mt-2 text-sm text-ink-muted">Visitors served</p>
          </div>
        </div>

        <div className="mt-16 border-t border-black/8 pt-16 text-center">
          <blockquote className="mx-auto max-w-2xl">
            <p className="font-heading text-xl leading-relaxed text-ink md:text-2xl">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <footer className="mt-6 text-ink-muted">
              {testimonial.name}, {testimonial.from}
            </footer>
          </blockquote>
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Testimonials">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2 w-8 transition-colors ${
                  i === active ? "bg-green-brand" : "bg-black/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {TRAVELLER_PHOTOS.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={src}
                alt={`Traveller photo ${i + 1} from Sauraha`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized={src.startsWith("http")}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
