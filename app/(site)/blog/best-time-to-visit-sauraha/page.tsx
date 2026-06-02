import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    absolute: "Best Time to Visit Sauraha & Chitwan (2026 Travel Guide)",
  },
  description:
    "Discover the best time to visit Sauraha and Chitwan National Park. Learn about weather, safari seasons, wildlife sightings, bird watching, and travel tips.",
  keywords: [
    "Best Time to Visit Sauraha",
    "Chitwan Travel Guide",
    "Sauraha Weather",
    "Chitwan National Park",
    "Nepal Safari",
    "Sauraha Tourism",
    "Visit Chitwan",
  ],
  openGraph: {
    title: "Best Time to Visit Sauraha & Chitwan",
    description:
      "Complete seasonal guide for visiting Sauraha and Chitwan National Park.",
    images: ["/images/sauraha-hero.jpg"],
    url: "https://www.saurahanepal.com/blog/best-time-to-visit-sauraha",
    type: "article",
  },
}

const IMAGES = {
  hero: "/images/sauraha-hero.jpg",
  autumn: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1000&q=80",
  winter: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&q=80",
  spring: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=80",
  monsoon: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80",
} as const

export default function BestTimeToVisitSauraha() {
  return (
    <main className="mt-[68px] bg-cream">
      <article className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12">
          <Link
            href="/"
            className="text-sm font-semibold text-green-mid transition-colors hover:text-green-brand"
          >
            ← Back to home
          </Link>
          <span className="section-label mt-6 block">Travel Guide</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight font-bold text-green-brand md:text-5xl">
            Best Time to Visit Sauraha & Chitwan: A Complete Seasonal Guide
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-mid">
            Discover the ideal season to explore Sauraha and Chitwan National
            Park. Whether you&apos;re planning a wildlife safari, bird-watching
            adventure, or cultural getaway, this guide will help you choose the
            perfect time to visit.
          </p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={IMAGES.hero}
              alt="Sauraha and Chitwan National Park"
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        </header>

        <section className="mb-12">
          <p className="mb-6 leading-8 text-text-mid">
            Nestled on the edge of Chitwan National Park, Sauraha is Nepal&apos;s
            premier wildlife destination. Famous for jungle safaris, one-horned
            rhinoceroses, Bengal tigers, canoe rides, and authentic Tharu culture,
            Sauraha attracts visitors from around the world throughout the year.
          </p>
          <p className="leading-8 text-text-mid">
            However, choosing the right season can significantly enhance your
            experience. Here is everything you need to know about the best time to
            visit Sauraha and Chitwan.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-border-brand bg-green-brand/5 p-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
            Quick Answer
          </h2>
          <p className="mt-4 text-lg text-text-brand">
            <strong>
              The best time to visit Sauraha and Chitwan is from October to March.
            </strong>
          </p>
          <ul className="mt-4 space-y-2 text-text-mid">
            <li>✅ Pleasant weather</li>
            <li>✅ Excellent wildlife sightings</li>
            <li>✅ Clear skies and beautiful sunsets</li>
            <li>✅ Comfortable jungle safari experiences</li>
            <li>✅ Ideal photography conditions</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Sauraha Weather by Season
          </h2>

          <SeasonBlock
            image={IMAGES.autumn}
            imageAlt="Autumn in Sauraha"
            title="🍂 Autumn (October – November)"
            badge="Best Overall Season"
            badgeClass="text-green-mid"
            intro="Autumn is widely considered the best season to visit Sauraha. Following the monsoon rains, the forests become lush and vibrant, while the weather remains clear and pleasant."
            temps={["25°C – 30°C (Day)", "15°C – 20°C"]}
            bullets={[
              "Excellent wildlife visibility",
              "Fresh greenery after monsoon",
              "Comfortable temperatures",
              "Perfect for photography",
              "Major festivals like Dashain and Tihar",
            ]}
          />

          <SeasonBlock
            image={IMAGES.winter}
            imageAlt="Winter safari in Chitwan"
            title="❄️ Winter (December – February)"
            badge="Best for Wildlife & Bird Watching"
            badgeClass="text-green-brand"
            intro="Winter offers cool mornings and pleasant afternoons. With shorter grasslands and dry conditions, wildlife sightings become much easier."
            temps={["18°C – 25°C (Day)", "5°C – 12°C"]}
            bullets={[
              "Excellent rhino sightings",
              "Peak bird-watching season",
              "Comfortable daytime temperatures",
              "Low humidity",
            ]}
          />

          <SeasonBlock
            image={IMAGES.spring}
            imageAlt="Spring in Chitwan"
            title="🌸 Spring (March – May)"
            badge="Best for Nature Lovers"
            badgeClass="text-orange-brand"
            intro="Spring transforms Chitwan into a colorful landscape filled with blooming flowers and thriving wildlife activity."
            temps={["28°C – 38°C (Day)", "18°C – 25°C"]}
            bullets={[
              "Beautiful flowering forests",
              "Great rhino sightings",
              "Less crowded than autumn",
              "Excellent nature photography",
            ]}
          />

          <SeasonBlock
            image={IMAGES.monsoon}
            imageAlt="Monsoon season in Chitwan"
            title="🌧️ Monsoon (June – September)"
            badge="Least Recommended Season"
            badgeClass="text-text-light"
            intro="The monsoon season brings heavy rainfall, creating lush green landscapes but limiting safari activities due to muddy trails and flooding."
            temps={["25°C – 35°C (Day)", "22°C – 28°C"]}
            bullets={[
              "Lower hotel prices",
              "Fewer tourists",
              "Beautiful green scenery",
              "Limited safari accessibility",
            ]}
            isLast
          />
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Best Time for Specific Activities
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-border-brand bg-white">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-cream">
                  <th className="p-4 text-left font-semibold text-text-brand">Activity</th>
                  <th className="p-4 text-left font-semibold text-text-brand">Best Time</th>
                </tr>
              </thead>
              <tbody className="text-text-mid">
                <ActivityRow activity="Jeep Safari" bestTime="October – March" />
                <ActivityRow activity="Rhino Spotting" bestTime="November – April" />
                <ActivityRow activity="Bird Watching" bestTime="December – February" />
                <ActivityRow activity="Photography" bestTime="October – February" />
                <ActivityRow activity="Tiger Tracking" bestTime="January – April" isLast />
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border-brand bg-white p-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Final Verdict
          </h2>
          <p className="mt-6 leading-8 text-text-mid">
            If you are planning your first trip to Sauraha and Chitwan, the months
            between October and March offer the most rewarding experience. You will
            enjoy pleasant weather, incredible wildlife encounters, beautiful sunsets
            along the Rapti River, and ideal safari conditions.
          </p>
          <p className="mt-4 leading-8 text-text-mid">
            For photographers, bird watchers, and wildlife enthusiasts, November
            through February is particularly outstanding. Regardless of when you visit,
            plan to stay at least 2–3 nights to fully experience everything Sauraha
            has to offer.
          </p>
          <Link href="/listings?category=activities" className="btn-primary mt-8 inline-block">
            Browse activities in Sauraha →
          </Link>
        </section>
      </article>
    </main>
  )
}

function SeasonBlock({
  image,
  imageAlt,
  title,
  badge,
  badgeClass,
  intro,
  temps,
  bullets,
  isLast,
}: {
  image: string
  imageAlt: string
  title: string
  badge: string
  badgeClass: string
  intro: string
  temps: [string, string]
  bullets: string[]
  isLast?: boolean
}) {
  return (
    <div className={isLast ? "mt-12" : "mb-12 mt-12"}>
      <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="896px" />
      </div>
      <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-text-brand">
        {title}
      </h3>
      <p className={`mt-2 mb-4 font-semibold ${badgeClass}`}>{badge}</p>
      <p className="mb-4 leading-8 text-text-mid">{intro}</p>
      <div className="mb-4 rounded-xl bg-cream p-5 text-text-mid">
        <p>
          <strong className="text-text-brand">Temperature:</strong> {temps[0]}
        </p>
        <p>
          <strong className="text-text-brand">Night:</strong> {temps[1]}
        </p>
      </div>
      <h4 className="mb-2 font-bold text-text-brand">Why Visit?</h4>
      <ul className="list-disc space-y-2 pl-6 text-text-mid">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ActivityRow({
  activity,
  bestTime,
  isLast,
}: {
  activity: string
  bestTime: string
  isLast?: boolean
}) {
  return (
    <tr className={isLast ? "" : "border-b border-border-brand"}>
      <td className="p-4">{activity}</td>
      <td className="p-4">{bestTime}</td>
    </tr>
  )
}
