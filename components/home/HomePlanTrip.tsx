"use client"

import Link from "next/link"
import { useState } from "react"
import ChatAssistantAvatar from "@/components/chat/ChatAssistantAvatar"
import { useChatUI } from "@/components/ChatUIProvider"
import { useT } from "@/components/i18n/LocaleProvider"
import { PLAN_TRIP_DHURBE, PLAN_TRIP_STEPS } from "@/lib/homepage-constants"

const TAB_IDS = ["plan", "stay", "do"] as const

const ROW_CLASS =
  "group flex w-full gap-6 py-6 text-left transition-colors hover:bg-white/60 md:items-center md:px-4"

function PlanTripDhurbeRow() {
  const { openChat } = useChatUI()

  return (
    <button type="button" className={ROW_CLASS} onClick={openChat}>
      <ChatAssistantAvatar size={56} variant="bubble" className="shrink-0" />
      <div className="flex-1">
        <h3 className="font-heading text-lg font-bold text-ink group-hover:text-green-brand md:text-xl">
          {PLAN_TRIP_DHURBE.title}
        </h3>
        <p className="mt-1 text-ink-muted">{PLAN_TRIP_DHURBE.description}</p>
      </div>
      <span className="hidden text-xl text-green-brand opacity-0 transition-opacity group-hover:opacity-100 md:inline">
        →
      </span>
    </button>
  )
}

function PlanTripStepRow({
  step,
}: {
  step: (typeof PLAN_TRIP_STEPS)[number]
}) {
  return (
    <Link href={step.href} className={ROW_CLASS}>
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
  )
}

export default function HomePlanTrip() {
  const t = useT()
  const [tab, setTab] = useState<(typeof TAB_IDS)[number]>("plan")
  const tabs = [
    { id: "plan" as const, label: t("home.planTabPlan") },
    { id: "stay" as const, label: t("home.planTabStay") },
    { id: "do" as const, label: t("home.planTabDo") },
  ]

  const steps =
    tab === "stay"
      ? PLAN_TRIP_STEPS.filter((step) => step.step === 2)
      : tab === "do"
        ? PLAN_TRIP_STEPS.filter((step) => step.step === 3)
        : PLAN_TRIP_STEPS

  return (
    <section id="plan-trip" className="home-section home-section-muted scroll-mt-24">
      <div className="site-container">
        <h2 className="nsw-section-title">{t("home.planTitle")}</h2>
        <p className="mt-4 max-w-xl text-ink-muted">{t("home.planSubtitle")}</p>

        <div
          className="mt-8 flex flex-wrap gap-2 border-b border-black/10"
          role="tablist"
          aria-label={t("home.planTitle")}
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-bold tracking-wide uppercase transition-colors ${
                tab === item.id
                  ? "border-green-brand text-green-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="mt-10 divide-y divide-black/8">
          {tab === "plan" && (
            <>
              <li>
                <PlanTripDhurbeRow />
              </li>
              <li className="flex items-center gap-4 px-4 py-5">
                <span className="h-px flex-1 bg-black/10" aria-hidden />
                <span className="text-sm font-bold tracking-wide text-ink-muted uppercase">
                  {t("home.planYourself")}
                </span>
                <span className="h-px flex-1 bg-black/10" aria-hidden />
              </li>
            </>
          )}
          {steps.map((step) => (
            <li key={step.step}>
              <PlanTripStepRow step={step} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
