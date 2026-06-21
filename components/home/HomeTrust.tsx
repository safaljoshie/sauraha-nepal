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
    <section className="home-section !py-8 md:!py-24">
      <div className="site-container">
        <div className="grid grid-cols-3 gap-px bg-black/10">
          <div className="rounded-xl bg-surface-muted px-2 py-3 text-center md:px-6 md:py-10">
            <p className="font-heading text-base font-bold text-ink md:text-4xl">{businessCount}+</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-ink-muted md:mt-2 md:text-sm">
              Businesses listed
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-2 py-3 text-center md:px-6 md:py-10">
            <p className="font-heading text-base font-bold text-ink md:text-4xl">{guidesCount}+</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-ink-muted md:mt-2 md:text-sm">
              Guides published
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-2 py-3 text-center md:px-6 md:py-10">
            <p className="font-heading text-base font-bold text-ink md:text-4xl">10k+</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-ink-muted md:mt-2 md:text-sm">
              Visitors served
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-black/8 pt-8 text-center md:mt-16 md:pt-16">
          <blockquote className="mx-auto max-w-2xl px-1">
            <p className="font-heading text-sm leading-relaxed text-ink md:text-2xl">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <footer className="mt-3 text-xs text-ink-muted md:mt-6 md:text-base">
              {testimonial.name}, {testimonial.from}
            </footer>
          </blockquote>
          <div className="mt-4 flex justify-center gap-2 md:mt-6" role="tablist" aria-label="Testimonials">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 w-6 transition-colors md:h-2 md:w-8 ${
                  i === active ? "bg-green-brand" : "bg-black/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-1.5 md:mt-14 md:grid-cols-6 md:gap-3">
          {TRAVELLER_PHOTOS.map((photo) => (
            <div key={photo.src} className="relative aspect-square overflow-hidden rounded-lg md:rounded-xl">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1400px) 16vw, 240px"
                quality={90}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
