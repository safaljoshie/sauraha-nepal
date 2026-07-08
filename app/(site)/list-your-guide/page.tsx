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
      <section className="relative mt-[68px] overflow-hidden bg-gradient-to-br from-green-brand to-[#0d3a18] px-8 py-20 text-center">
        <Image
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white md:text-5xl">
            List Yourself as a Licensed Tour Guide in Sauraha
          </h1>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            Reach travellers looking for jungle safaris, birdwatching, and cultural tours in
            Chitwan.
          </p>
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

      <section className="bg-white px-8 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="section-label text-center">How it works</p>
          <h2 className="section-title text-center">Three simple steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
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

      <section className="bg-cream px-8 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label text-center">Apply Now</p>
          <h2 className="section-title text-center">Submit your guide application</h2>
          <div className="mt-10">
            <ListGuideForm />
          </div>
        </div>
      </section>
    </main>
  )
}
