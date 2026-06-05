import Image from "next/image"
import Link from "next/link"

const BENEFITS = [
  "Global visibility to travellers planning Chitwan",
  "Google Maps on your business profile",
  "Direct contact & reviews",
  "Mobile-friendly listing page",
  "SEO across Sauraha Nepal",
]

export default function HomeListBusiness() {
  return (
    <section className="home-section py-12 md:py-16">
      <div className="site-container">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/images/home-hero.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1400px"
          />
          <div className="absolute inset-0 bg-green-brand/88" />
        </div>
        <div className="relative z-10 grid w-full gap-8 px-6 py-10 sm:gap-10 sm:py-12 md:grid-cols-2 md:gap-10 md:px-10 md:py-16 lg:py-20">
          <div className="text-white">
            <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
              For local businesses
            </p>
            <h2 className="mt-3 font-heading text-2xl leading-tight font-bold sm:text-3xl md:text-4xl">
              Grow your business in Sauraha
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              List your hotel, restaurant, or tour operation — free to start.
            </p>
            <Link
              href="/list-your-business"
              className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-bold tracking-wide text-green-brand uppercase hover:bg-white/90"
            >
              List your business free
            </Link>
          </div>
          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="border-l-2 border-orange-brand bg-black/20 px-5 py-3 text-sm text-white/90 backdrop-blur-sm sm:text-base"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </section>
  )
}
