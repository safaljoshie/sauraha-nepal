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
    <section className="home-section !py-8 md:py-16">
      <div className="site-container">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
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
        <div className="relative z-10 grid w-full gap-4 px-4 py-6 sm:gap-10 sm:py-12 md:grid-cols-2 md:gap-10 md:px-10 md:py-16 lg:py-20">
          <div className="text-white">
            <p className="text-[0.65rem] font-bold tracking-[0.15em] text-white/70 uppercase md:text-xs md:tracking-[0.2em]">
              For local businesses
            </p>
            <h2 className="mt-2 font-heading text-lg leading-tight font-bold md:mt-3 md:text-4xl">
              Grow your business in Sauraha
            </h2>
            <p className="mt-2 max-w-md text-sm leading-snug text-white/85 md:mt-4 md:text-lg">
              List your hotel, restaurant, or tour operation — free to start.
            </p>
            <Link
              href="/list-your-business"
              className="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-xs font-bold tracking-wide text-green-brand uppercase hover:bg-white/90 md:mt-8 md:px-8 md:py-3.5 md:text-sm"
            >
              List your business free
            </Link>
          </div>
          <ul className="space-y-2 md:space-y-3">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="border-l-2 border-orange-brand bg-black/20 px-3 py-2 text-xs text-white/90 backdrop-blur-sm md:px-5 md:py-3 md:text-base"
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
