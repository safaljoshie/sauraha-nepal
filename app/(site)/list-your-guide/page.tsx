import Image from "next/image"
import type { Metadata } from "next"
import ListGuideForm from "@/components/ListGuideForm"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "List Yourself as a Guide",
  description:
    "Apply to list your licensed tour guide profile on Sauraha Nepal — reach travellers visiting Chitwan National Park.",
  path: "/list-your-guide",
})

const heroStats = [
  { value: "50,000+", label: "Annual visitors" },
  { value: "Free", label: "Profile listing" },
  { value: "24hr", label: "Review time" },
  { value: "Direct", label: "Traveller contact" },
]

const guideSteps = [
  {
    step: 1,
    title: "Apply",
    description: "Fill in your profile, languages, expertise, and services.",
  },
  {
    step: 2,
    title: "Review",
    description: "Our team verifies your details within 24 hours.",
  },
  {
    step: 3,
    title: "Go live",
    description: "Approved profiles appear on our Tour Guides directory.",
  },
]

export default function ListYourGuidePage() {
  return (
    <main>
      <section className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-4 py-12 text-center sm:px-6 md:px-8 md:py-20">
        <Image
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl md:text-5xl">
            List Yourself as a Licensed Tour Guide in Sauraha
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base md:text-lg">
            Reach travellers looking for jungle safaris, birdwatching, and cultural tours in
            Chitwan.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:mt-10 md:flex md:flex-wrap md:justify-center md:gap-8">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-white">
                <strong className="block text-xl font-bold text-orange-light sm:text-2xl">
                  {stat.value}
                </strong>
                <span className="text-xs text-white/75 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="section-label text-center">How it works</p>
          <h2 className="section-title text-center">Three simple steps</h2>
          <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-3">
            {guideSteps.map((item) => (
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

      <section className="bg-cream px-4 pb-28 sm:px-6 md:px-8 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label text-center">Apply Now</p>
          <h2 className="section-title text-center">Submit your guide application</h2>
          <div className="mt-6 sm:mt-10">
            <ListGuideForm />
          </div>
        </div>
      </section>
    </main>
  )
}
