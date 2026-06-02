import Image from "next/image"
import type { Metadata } from "next"
import ListBusinessForm from "@/components/ListBusinessForm"
import { listingSteps, pricingPlans } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "List Your Business",
  description:
    "List your hotel, restaurant, or activity on Sauraha Nepal — reach travellers visiting Chitwan National Park.",
  path: "/list-your-business",
})

const heroStats = [
  { value: "50,000+", label: "Annual visitors" },
  { value: "120+", label: "Listed businesses" },
  { value: "Free", label: "Basic listing" },
  { value: "24hr", label: "Approval" },
]

export default function ListYourBusinessPage() {
  return (
    <main>
      <section className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-8 py-20 text-center">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-5xl">
            Reach Thousands of Travellers Visiting Sauraha
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-white">
                <strong className="block text-2xl font-bold text-orange-light">
                  {stat.value}
                </strong>
                <span className="text-sm text-white/75">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="section-label">Why List With Us</p>
          <h2 className="sr-only">Grow your business in Sauraha</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border-brand shadow-[0_12px_40px_rgba(26,92,42,0.1)]">
            <Image
              src="/images/grow-your-business-sauraha.png"
              alt="Grow your business in Sauraha with saurahanepal.com — global reach, mobile-friendly listings, reviews, Google Maps, photo gallery, and direct WhatsApp"
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
          <p className="section-label text-center">Pricing</p>
          <h2 className="section-title text-center">Choose your plan</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 bg-white p-8 ${
                  plan.popular ? "border-orange-brand shadow-lg" : "border-border-brand"
                }`}
              >
                {plan.popular && (
                  <span className="mb-4 inline-block rounded-full bg-orange-brand px-3 py-1 text-xs font-bold text-white uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
                  {plan.name}
                </h3>
                <p className="mt-2 text-3xl font-bold text-orange-brand">
                  {plan.price}
                  <span className="text-sm font-normal text-text-light"> / {plan.period}</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm text-text-mid">
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

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="section-label text-center">How It Works</p>
          <h2 className="section-title text-center">Four simple steps</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {listingSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-brand text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-green-brand">{item.title}</h3>
                <p className="text-sm text-text-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-8 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label text-center">Apply Now</p>
          <h2 className="section-title text-center">Submit your listing</h2>
          <div className="mt-10">
            <ListBusinessForm />
          </div>
        </div>
      </section>
    </main>
  )
}
