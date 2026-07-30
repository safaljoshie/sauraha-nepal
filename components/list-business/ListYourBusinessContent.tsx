"use client"

import Image from "next/image"
import ListBusinessForm from "@/components/ListBusinessForm"
import NprPrice from "@/components/currency/NprPrice"
import { useT } from "@/components/i18n/LocaleProvider"
import { listingSteps, pricingPlans } from "@/lib/data"

export default function ListYourBusinessContent({
  categories,
}: {
  categories: string[]
}) {
  const t = useT()
  const heroStats = [
    { value: "50,000+", label: t("listBusiness.statVisitors") },
    { value: "120+", label: t("listBusiness.statBusinesses") },
    { value: t("contact.free"), label: t("listBusiness.statBasic") },
    { value: "24hr", label: t("listBusiness.statApproval") },
  ]

  return (
    <>
      <section className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-8 py-20 text-center">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-5xl">
            {t("listBusiness.heroTitle")}
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-white">
                <strong className="block text-2xl font-bold text-orange-light">{stat.value}</strong>
                <span className="text-sm text-white/75">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-label">{t("listBusiness.whyLabel")}</p>
          <h2 className="sr-only">{t("home.listBizTitle")}</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border-brand shadow-[0_12px_40px_rgba(26,92,42,0.1)]">
            <Image
              src="/images/grow-your-business-sauraha.png"
              alt={t("home.listBizTitle")}
              width={1536}
              height={1024}
              className="h-auto w-full"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-cream px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-label text-center">{t("listBusiness.pricingLabel")}</p>
          <h2 className="section-title text-center">{t("listBusiness.pricingTitle")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 bg-white p-4 ${
                  plan.popular ? "border-orange-brand shadow-lg" : "border-border-brand"
                }`}
              >
                {plan.popular && (
                  <span className="mb-2 inline-block rounded-full bg-orange-brand px-2.5 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                    {t("listBusiness.mostPopular")}
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xl font-bold text-orange-brand">
                  {plan.amountNpr != null ? <NprPrice amount={plan.amountNpr} /> : plan.price}
                  <span className="text-xs font-normal text-text-light">
                    {" "}
                    /{" "}
                    {plan.amountNpr == null
                      ? t("listBusiness.periodForever")
                      : t("listBusiness.periodYear")}
                  </span>
                </p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-1.5 text-xs leading-snug text-text-mid">
                      <span className="text-green-mid">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-8 md:py-10">
        <div className="mx-auto max-w-4xl">
          <p className="section-label mb-1 text-center">{t("listBusiness.howLabel")}</p>
          <h2 className="mb-2 text-center font-[family-name:var(--font-playfair)] text-lg font-bold text-green-brand md:text-xl">
            {t("listBusiness.howTitle")}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {listingSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-brand text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-0.5 text-sm font-semibold text-green-brand">{item.title}</h3>
                <p className="text-xs leading-snug text-text-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-8 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label text-center">{t("listBusiness.applyLabel")}</p>
          <h2 className="section-title text-center">{t("listBusiness.applyTitle")}</h2>
          <div className="mt-10">
            <ListBusinessForm categories={categories} />
          </div>
        </div>
      </section>
    </>
  )
}
