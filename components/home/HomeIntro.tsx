import Link from "next/link"

export default function HomeIntro() {
  return (
    <section id="why-visit" className="home-section scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="nsw-section-title">Sauraha, Nepal</h2>
        <div className="mt-6 space-y-5 text-[1.125rem] leading-[1.8] text-ink-muted">
          <p>
            Welcome to Sauraha — the gateway to Chitwan National Park. Let us
            inspire your next journey through Nepal&apos;s wildlife capital, from
            rhino encounters at dawn to riverside sunsets on the Rapti.
          </p>
          <p>
            Follow birdsong through sal forest to thundering elephant grasslands.
            Glide down the river at sunrise or slip into a jungle safari before
            dusk. Taste Tharu specialities, fresh river fish, and homely dal bhat
            after a day in the park. Connect with local guides and communities
            making new friends along the way.
          </p>
          <p className="hidden md:block">
            So, where to first? Browse places to explore below, find stays and
            restaurants, book activities, and read our travel guides for permits,
            transport, and seasonal tips.
          </p>
        </div>
        <Link href="/about" className="nsw-view-all mt-8 inline-flex">
          Read more about Sauraha
        </Link>
      </div>
    </section>
  )
}
