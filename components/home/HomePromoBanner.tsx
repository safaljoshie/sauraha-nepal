import Image from "next/image"
import Link from "next/link"

export default function HomePromoBanner() {
  return (
    <section className="home-section py-0">
      <div className="site-container">
      <Link
        href="/blog/how-to-get-to-sauraha-from-kathmandu-and-pokhara-2026-travel-guide"
        className="group relative block overflow-hidden rounded-2xl"
      >
        <div className="relative aspect-[21/9] min-h-[200px] md:aspect-[3/1]">
          <Image
            src="/images/plan-your-journey-sauraha.png"
            alt="Elephants and mahouts crossing a river near the jungle in Sauraha"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 1400px"
            quality={90}
            unoptimized
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14">
            <p className="text-xs font-bold tracking-[0.25em] text-white/80 uppercase">
              Plan your journey
            </p>
            <h2 className="mt-2 max-w-lg font-heading text-2xl font-bold text-white md:text-4xl">
              How to get to Sauraha from Kathmandu &amp; Pokhara
            </h2>
            <span className="nsw-view-all mt-4 !text-white !decoration-white/50 group-hover:!text-orange-light">
              Read the travel guide
            </span>
          </div>
        </div>
      </Link>
      </div>
    </section>
  )
}
