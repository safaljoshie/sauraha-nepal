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
    <section className="relative overflow-hidden">
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl md:min-h-[380px]">
        <Image
          src="/images/home-hero.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-green-brand/88" aria-hidden />
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-2 md:px-10 md:py-20">
          <div className="text-white">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
              For local businesses
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">
              Grow your business in Sauraha
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/85">
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
                className="border-l-2 border-orange-brand bg-black/20 px-5 py-3 text-white/90 backdrop-blur-sm"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
