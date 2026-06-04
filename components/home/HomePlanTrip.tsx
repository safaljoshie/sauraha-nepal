"use client"

import Link from "next/link"
import { useState } from "react"
import { PLAN_TRIP_STEPS } from "@/lib/homepage-constants"

const STEP_LINKS = [
  "/blog",
  "/listings?category=stay",
  "/listings?category=activities",
  "/listings?category=eat",
  "/blog",
]

const TABS = [
  { id: "plan", label: "Plan your visit" },
  { id: "stay", label: "Where to stay" },
  { id: "do", label: "Things to do" },
] as const

export default function HomePlanTrip() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("plan")

  const steps =
    tab === "stay"
      ? PLAN_TRIP_STEPS.filter((_, i) => i === 1)
      : tab === "do"
        ? PLAN_TRIP_STEPS.filter((_, i) => i === 2)
        : PLAN_TRIP_STEPS

  const stepOffset = tab === "stay" ? 1 : tab === "do" ? 2 : 0

  return (
    <section id="plan-trip" className="home-section home-section-muted scroll-mt-24">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="nsw-section-title">Choose your path</h2>
        <p className="mt-4 max-w-xl text-ink-muted">
          Plan dates, book stays, reserve activities, and find travel information —
          your Chitwan itinerary starts here.
        </p>

        <div
          className="mt-8 flex flex-wrap gap-2 border-b border-black/10"
          role="tablist"
          aria-label="Trip planning"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-bold tracking-wide uppercase transition-colors ${
                tab === t.id
                  ? "border-green-brand text-green-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul className="mt-10 divide-y divide-black/8">
          {steps.map((step, i) => {
            const idx = tab === "plan" ? i : stepOffset
            return (
              <li key={step.step}>
                <Link
                  href={STEP_LINKS[idx]}
                  className="group flex gap-6 py-6 transition-colors hover:bg-white/60 md:items-center md:px-4"
                >
                  <span className="font-heading text-3xl font-bold text-green-brand/30 md:text-4xl">
                    {String(step.step).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-bold text-ink group-hover:text-green-brand md:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-ink-muted">{step.description}</p>
                  </div>
                  <span className="hidden text-xl text-green-brand opacity-0 transition-opacity group-hover:opacity-100 md:inline">
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
