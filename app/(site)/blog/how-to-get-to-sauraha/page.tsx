import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import BlogPostFooter from "@/components/blog/BlogPostFooter"
import { getBlogPost } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: {
    absolute: "How to Travel to Sauraha from Kathmandu & Pokhara | Complete Guide",
  },
  description:
    "Learn the best ways to travel to Sauraha from Kathmandu and Pokhara. Compare tourist buses, flights, private vehicles, and travel costs.",
  keywords: [
    "Kathmandu to Sauraha",
    "Pokhara to Sauraha",
    "How to reach Sauraha",
    "Sauraha travel guide",
    "Chitwan travel",
    "Tourist bus to Sauraha",
    "Nepal travel guide",
  ],
  openGraph: {
    title: "How to Travel to Sauraha from Kathmandu & Pokhara",
    description:
      "Compare tourist buses, flights, private vehicles, and travel costs to reach Sauraha and Chitwan.",
    images: ["/images/kathmandu-pokhara-sauraha.jpg"],
    url: "https://www.saurahanepal.com/blog/how-to-get-to-sauraha",
    type: "article",
  },
}

const IMAGES = {
  hero: "/images/kathmandu-pokhara-sauraha.jpg",
  kathmandu: "/images/kathmandu-to-sauraha.jpg",
  pokhara: "/images/pokhara-to-sauraha.jpg",
} as const

const post = getBlogPost("how-to-get-to-sauraha")!

export default function TravelToSaurahaPage() {
  return (
    <main className="mt-[68px] bg-cream">
      <article className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12">
          <Link
            href="/blog"
            className="text-sm font-semibold text-green-mid transition-colors hover:text-green-brand"
          >
            ← Back to blog
          </Link>
          <span className="section-label mt-6 block">Travel Guide</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight font-bold text-green-brand md:text-5xl">
            How to Travel to Sauraha from Kathmandu & Pokhara
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-mid">
            Planning a trip to Sauraha and Chitwan National Park? Whether you&apos;re
            coming from Kathmandu or Pokhara, this guide covers all available
            transportation options, travel times, costs, and practical tips to help
            you reach Nepal&apos;s most famous wildlife destination.
          </p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={IMAGES.hero}
              alt="Traveling to Sauraha"
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        </header>

        <section className="mb-12">
          <p className="mb-4 leading-8 text-text-mid">
            Sauraha is the main gateway to Chitwan National Park and one of
            Nepal&apos;s most popular tourist destinations. Located in the southern plains
            of Nepal, Sauraha is easily accessible from both Kathmandu and Pokhara.
          </p>
          <p className="leading-8 text-text-mid">
            Visitors can choose between tourist buses, domestic flights, private
            vehicles, and rental cars depending on their budget and travel style.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-border-brand bg-green-brand/5 p-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-green-brand">
            Quick Travel Summary
          </h2>
          <ul className="mt-4 space-y-3 text-text-mid">
            <li>
              🚌 <strong className="text-text-brand">Kathmandu to Sauraha:</strong> 5–7
              hours by tourist bus
            </li>
            <li>
              ✈️ <strong className="text-text-brand">Kathmandu to Bharatpur:</strong>{" "}
              20–25 minute flight + 30 minute drive
            </li>
            <li>
              🚌 <strong className="text-text-brand">Pokhara to Sauraha:</strong> 4–6
              hours by tourist bus
            </li>
            <li>
              🚗 <strong className="text-text-brand">Private Vehicle:</strong> Most
              comfortable option
            </li>
            <li>
              💰 <strong className="text-text-brand">Budget Option:</strong> Tourist bus
            </li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Traveling from Kathmandu to Sauraha
          </h2>
          <div className="relative mt-8 mb-6 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={IMAGES.kathmandu}
              alt="Kathmandu to Sauraha"
              fill
              className="object-cover"
              sizes="896px"
            />
          </div>
          <p className="mb-6 leading-8 text-text-mid">
            The distance between Kathmandu and Sauraha is approximately 160 km. Thanks
            to improved highways, reaching Sauraha has become much easier than in
            previous years.
          </p>

          <TransportOption
            title="🚌 Tourist Bus (Most Popular)"
            items={[
              ["Travel Time", "5–7 Hours"],
              ["Cost", "NPR 1,000–2,000"],
              ["Departure", "Early morning"],
              ["Comfort", "Air-conditioned buses available"],
            ]}
            note="Tourist buses offer the best balance between comfort and cost for most travelers."
          />
          <TransportOption
            title="✈️ Flight to Bharatpur Airport"
            items={[
              ["Flight Time", "20–25 Minutes"],
              ["Airport Transfer", "20–30 Minutes"],
              ["Cost", "NPR 4,000–8,000+"],
            ]}
            note="The fastest way to reach Sauraha. Bharatpur Airport is located approximately 18 km from Sauraha."
          />
          <TransportOption
            title="🚗 Private Vehicle"
            items={[
              ["Travel Time", "4–6 Hours"],
              ["Ideal For", "Families & Groups"],
              ["Advantage", "Flexible schedule"],
            ]}
            note="Private vehicles offer convenience and the ability to stop at viewpoints and restaurants along the journey."
            isLast
          />
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Traveling from Pokhara to Sauraha
          </h2>
          <div className="relative mt-8 mb-6 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={IMAGES.pokhara}
              alt="Pokhara to Sauraha"
              fill
              className="object-cover"
              sizes="896px"
            />
          </div>
          <p className="mb-6 leading-8 text-text-mid">
            Many visitors combine Pokhara and Chitwan in the same itinerary. Sauraha is
            located approximately 145 km from Pokhara.
          </p>

          <TransportOption
            title="🚌 Tourist Bus"
            items={[
              ["Travel Time", "4–6 Hours"],
              ["Cost", "NPR 800–1,800"],
              ["Daily Departures", "Available"],
            ]}
            note="The most common and affordable way to travel between Pokhara and Sauraha."
          />
          <TransportOption
            title="🚗 Private Vehicle"
            items={[
              ["Travel Time", "4–5 Hours"],
              ["Best For", "Families and small groups"],
            ]}
            note="Private transportation provides flexibility and a more comfortable travel experience."
            isLast
          />
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Transportation Comparison
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-border-brand bg-white">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-cream">
                  <th className="p-4 text-left font-semibold text-text-brand">Option</th>
                  <th className="p-4 text-left font-semibold text-text-brand">Travel Time</th>
                  <th className="p-4 text-left font-semibold text-text-brand">Cost</th>
                  <th className="p-4 text-left font-semibold text-text-brand">Comfort</th>
                </tr>
              </thead>
              <tbody className="text-text-mid">
                <CompareRow option="Tourist Bus" time="4–7 Hours" cost="$" comfort="⭐⭐⭐" />
                <CompareRow
                  option="Flight + Transfer"
                  time="1 Hour"
                  cost="$$$"
                  comfort="⭐⭐⭐⭐⭐"
                />
                <CompareRow
                  option="Private Vehicle"
                  time="4–6 Hours"
                  cost="$$"
                  comfort="⭐⭐⭐⭐⭐"
                  isLast
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-border-brand bg-green-brand/5 p-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Recommended Nepal Tourist Route
          </h2>
          <div className="mt-6 space-y-3 text-lg text-text-brand">
            <p>📍 Kathmandu → Chitwan (2–3 Nights)</p>
            <p>📍 Chitwan → Pokhara (2–4 Nights)</p>
            <p>📍 Pokhara → Kathmandu</p>
          </div>
          <p className="mt-6 leading-8 text-text-mid">
            This route is one of Nepal&apos;s most popular travel circuits and offers a
            perfect combination of culture, wildlife, adventure, and mountain scenery.
          </p>
        </section>

        <section className="rounded-2xl border border-border-brand bg-white p-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-green-brand">
            Final Thoughts
          </h2>
          <p className="mt-6 leading-8 text-text-mid">
            Sauraha is well connected to both Kathmandu and Pokhara, making it an easy
            addition to any Nepal itinerary. Budget travelers often prefer tourist buses,
            while families and luxury travelers usually opt for private vehicles or
            domestic flights.
          </p>
          <p className="mt-4 leading-8 text-text-mid">
            Regardless of your choice, the journey to Sauraha is rewarded with
            unforgettable wildlife experiences, stunning sunsets, and the natural beauty
            of Chitwan National Park.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/listings?category=transport" className="btn-primary inline-block">
              Find transport in Sauraha →
            </Link>
            <Link
              href="/blog/best-time-to-visit-sauraha"
              className="inline-block rounded-full border border-green-brand px-6 py-2 font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white"
            >
              Best time to visit →
            </Link>
          </div>
        </section>

        <BlogPostFooter post={post} />
      </article>
    </main>
  )
}

function TransportOption({
  title,
  items,
  note,
  isLast,
}: {
  title: string
  items: [string, string][]
  note: string
  isLast?: boolean
}) {
  return (
    <div
      className={`rounded-xl bg-white p-6 ${isLast ? "" : "mb-6"} border border-border-brand`}
    >
      <h3 className="text-xl font-bold text-text-brand">{title}</h3>
      <ul className="mt-3 space-y-2 text-text-mid">
        {items.map(([label, value]) => (
          <li key={label}>
            <strong className="text-text-brand">{label}:</strong> {value}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-text-mid">{note}</p>
    </div>
  )
}

function CompareRow({
  option,
  time,
  cost,
  comfort,
  isLast,
}: {
  option: string
  time: string
  cost: string
  comfort: string
  isLast?: boolean
}) {
  return (
    <tr className={isLast ? "" : "border-b border-border-brand"}>
      <td className="p-4">{option}</td>
      <td className="p-4">{time}</td>
      <td className="p-4">{cost}</td>
      <td className="p-4">{comfort}</td>
    </tr>
  )
}
