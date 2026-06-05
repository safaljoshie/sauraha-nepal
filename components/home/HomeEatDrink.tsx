import Image from "next/image"
import Link from "next/link"
import { EAT_SHOWCASE } from "@/lib/homepage-constants"

export default function HomeEatDrink() {
  return (
    <section id="eat-drink" className="home-section home-section-muted scroll-mt-24">
      <div className="site-container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <h2 className="nsw-section-title">Eat &amp; drink</h2>
          <Link href="/listings?category=eat" className="nsw-view-all shrink-0">
            View all restaurants
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EAT_SHOWCASE.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="card-hover group relative block aspect-[5/4] overflow-hidden rounded-2xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="300px"
              />
              <div className="nsw-destination-overlay" aria-hidden />
              <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
                <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/85">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
